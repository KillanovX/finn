# Plano de Implementação — SaaS de Finanças Pessoais com IA

> Stack: Next.js 16 · React 19 · TypeScript 5.7 · Tailwind CSS v4 · shadcn/ui · Recharts · Zara (NVIDIA Nemotron) · Web Speech API · Supabase

---

## Índice

1. [Arquitetura Geral](#1-arquitetura-geral)
2. [Sistema de Autenticação & Onboarding](#2-sistema-de-autenticação--onboarding)
3. [Dashboard Principal — Expansão](#3-dashboard-principal--expansão)
4. [Módulo de Transações](#4-módulo-de-transações)
5. [Módulo de Orçamentos (Budgets)](#5-módulo-de-orçamentos-budgets)
6. [Módulo de Metas Financeiras](#6-módulo-de-metas-financeiras)
7. [Módulo de Contas & Carteiras](#7-módulo-de-contas--carteiras)
8. [Módulo de Relatórios & Analytics](#8-módulo-de-relatórios--analytics)
9. [Módulo de Recorrências & Assinaturas](#9-módulo-de-recorrências--assinaturas)
10. [Assistente Zara — Expansão de Capacidades](#10-assistente-zara--expansão-de-capacidades)
11. [Sistema de Notificações & Alertas](#11-sistema-de-notificações--alertas)
12. [Configurações & Perfil do Usuário](#12-configurações--perfil-do-usuário)
13. [Infraestrutura de Dados & API Routes](#13-infraestrutura-de-dados--api-routes)
14. [Design System & Componentes Atômicos](#14-design-system--componentes-atômicos)
15. [Performance, Acessibilidade & SEO](#15-performance-acessibilidade--seo)
16. [Roadmap por Sprints](#16-roadmap-por-sprints)

---

## 1. Arquitetura Geral

### 1.1 Estrutura de Pastas (App Router)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── onboarding/
│   │       ├── perfil/page.tsx
│   │       ├── contas/page.tsx
│   │       └── metas/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx              ← Shell principal com sidebar + AgentDock
│   │   ├── dashboard/page.tsx
│   │   ├── transacoes/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── orcamentos/page.tsx
│   │   ├── metas/page.tsx
│   │   ├── contas/page.tsx
│   │   ├── relatorios/page.tsx
│   │   ├── recorrencias/page.tsx
│   │   └── configuracoes/page.tsx
│   └── api/
│       ├── chat/route.ts
│       ├── transactions/route.ts
│       ├── budgets/route.ts
│       ├── goals/route.ts
│       ├── accounts/route.ts
│       ├── reports/route.ts
│       └── webhooks/route.ts
├── components/
│   ├── ui/                         ← shadcn/ui base components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── AgentDock.tsx
│   ├── dashboard/
│   ├── transactions/
│   ├── budgets/
│   ├── goals/
│   ├── reports/
│   └── shared/
├── hooks/
├── lib/
│   ├── supabase/
│   │   ├── client.ts           ← createBrowserClient (componentes cliente)
│   │   ├── server.ts           ← createServerClient (Server Components / Route Handlers)
│   │   ├── middleware.ts        ← createMiddlewareClient (refresh de sessão)
│   │   └── types.ts            ← Database type gerado pelo CLI
│   ├── ai/
│   └── utils/
├── store/                          ← Zustand stores
└── types/
```

### 1.2 Camada de Dados

- **Banco de dados:** Supabase (PostgreSQL gerenciado) — acesso via `supabase-js` + Prisma ORM para migrações e tipagem
- **Autenticação:** Supabase Auth nativo (substitui NextAuth.js — ver seção 2)
- **Storage:** Supabase Storage para comprovantes e anexos de transações (bucket `attachments`, acesso controlado por RLS)
- **Realtime:** Supabase Realtime para atualização ao vivo do saldo e notificações in-app via WebSocket
- **Cache:** Upstash Redis para rate-limiting da IA e cache de relatórios pesados
- **Estado global:** Zustand (leveza + TypeScript nativo)
- **Formulários:** React Hook Form + Zod para validação end-to-end

**Pacotes necessários:**
```bash
pnpm add @supabase/supabase-js @supabase/ssr prisma @prisma/client
pnpm add -D supabase  # CLI local para migrations e type-gen
```

**Variáveis de ambiente:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...    # apenas server-side
DATABASE_URL=postgresql://...        # connection string para Prisma (Transaction Pooler)
DIRECT_URL=postgresql://...          # connection string direta para migrate
```

**Clientes Supabase por contexto (`@supabase/ssr`):**
```typescript
// lib/supabase/client.ts — Browser (Client Components)
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// lib/supabase/server.ts — Server Components / Route Handlers
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (list) => list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  );
}
```

### 1.3 Modelo de Dados

O Supabase usa **PostgreSQL nativo**. As migrações são escritas em SQL puro (via Supabase CLI) e o Prisma é usado apenas para geração de tipos TypeScript e queries. A tabela `users` estende o `auth.users` do Supabase Auth.

**Estratégia Prisma + Supabase:**
- Prisma schema com `datasource` apontando para `DATABASE_URL` (Transaction Pooler porta 6543)
- `DIRECT_URL` (porta 5432) para `prisma migrate deploy`
- `supabase gen types typescript` para gerar `lib/supabase/types.ts` com tipos do banco

```prisma
// prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

**Migration SQL (supabase/migrations/0001_init.sql):**

```sql
-- Tipos ENUM
CREATE TYPE account_type  AS ENUM ('CHECKING','SAVINGS','CREDIT','INVESTMENT','WALLET');
CREATE TYPE transaction_type AS ENUM ('INCOME','EXPENSE','TRANSFER');
CREATE TYPE period        AS ENUM ('DAILY','WEEKLY','MONTHLY','YEARLY');
CREATE TYPE goal_category AS ENUM ('EMERGENCY','TRAVEL','ASSET','VEHICLE','EDUCATION','INVESTMENT','OTHER');

-- Perfil do usuário (vinculado ao auth.users do Supabase)
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  avatar_url      TEXT,
  currency        TEXT NOT NULL DEFAULT 'BRL',
  locale          TEXT NOT NULL DEFAULT 'pt-BR',
  monthly_income  NUMERIC(12,2),
  goal_profile    TEXT,          -- objetivo escolhido no onboarding
  experience_level TEXT,         -- BEGINNER | INTERMEDIATE | ADVANCED
  onboarding_done BOOLEAN DEFAULT FALSE,
  month_start_day INT DEFAULT 1, -- dia de início do mês financeiro
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Contas bancárias / carteiras
CREATE TABLE accounts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        account_type NOT NULL,
  bank        TEXT,
  balance     NUMERIC(12,2) NOT NULL DEFAULT 0,
  color       TEXT NOT NULL DEFAULT '#6366f1',
  icon        TEXT,
  is_default  BOOLEAN DEFAULT FALSE,
  credit_limit        NUMERIC(12,2),   -- apenas tipo CREDIT
  closing_day         INT,             -- dia fechamento fatura
  due_day             INT,             -- dia vencimento fatura
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Recorrências (antes de transactions para FK)
CREATE TABLE recurrences (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  description  TEXT NOT NULL,
  amount       NUMERIC(12,2) NOT NULL,
  type         transaction_type NOT NULL,
  category     TEXT NOT NULL,
  subcategory  TEXT,
  account_id   UUID REFERENCES accounts(id),
  frequency    period NOT NULL,
  day_of_month INT,
  next_due_date DATE NOT NULL,
  is_active    BOOLEAN DEFAULT TRUE,
  auto_create  BOOLEAN DEFAULT TRUE,  -- criar automaticamente ou aguardar aprovação
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Transações
CREATE TABLE transactions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_id     UUID NOT NULL REFERENCES accounts(id),
  amount         NUMERIC(12,2) NOT NULL,
  type           transaction_type NOT NULL,
  category       TEXT NOT NULL,
  subcategory    TEXT,
  description    TEXT NOT NULL,
  date           DATE NOT NULL,
  tags           TEXT[] DEFAULT '{}',
  attachments    TEXT[] DEFAULT '{}',  -- caminhos no Supabase Storage
  recurrence_id  UUID REFERENCES recurrences(id),
  is_confirmed   BOOLEAN DEFAULT TRUE,
  notes          TEXT,
  -- para parcelamentos
  installment_total   INT,
  installment_current INT,
  installment_group   UUID,           -- agrupa todas as parcelas
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Orçamentos
CREATE TABLE budgets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category   TEXT NOT NULL,
  limit_amount NUMERIC(12,2) NOT NULL,
  period     period NOT NULL DEFAULT 'MONTHLY',
  color      TEXT NOT NULL DEFAULT '#22c55e',
  icon       TEXT,
  alert_at   INT NOT NULL DEFAULT 80,   -- % para alertar
  rollover   BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, category, period)
);

-- Metas financeiras
CREATE TABLE goals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  target_amount  NUMERIC(12,2) NOT NULL,
  saved_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,
  deadline       DATE,
  category       goal_category NOT NULL DEFAULT 'OTHER',
  color          TEXT NOT NULL DEFAULT '#8b5cf6',
  icon           TEXT,
  is_completed   BOOLEAN DEFAULT FALSE,
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Depósitos em metas (histórico)
CREATE TABLE goal_deposits (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id    UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount     NUMERIC(12,2) NOT NULL,
  account_id UUID REFERENCES accounts(id),
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Histórico do chat com a Zara
CREATE TABLE chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content    TEXT NOT NULL,
  feedback   SMALLINT,   -- 1 (👍) | -1 (👎) | NULL
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notificações
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  read       BOOLEAN DEFAULT FALSE,
  data       JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de performance
CREATE INDEX idx_transactions_user_date   ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_cat    ON transactions(user_id, category);
CREATE INDEX idx_transactions_account     ON transactions(account_id);
CREATE INDEX idx_recurrences_next_due     ON recurrences(next_due_date) WHERE is_active = TRUE;
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;
```

**Row Level Security (RLS) — segurança por usuário:**

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurrences   ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Padrão: cada usuário vê/altera apenas seus próprios dados
CREATE POLICY "users_own_data" ON profiles
  USING (id = auth.uid());

-- Replicar para cada tabela com user_id
CREATE POLICY "users_own_data" ON accounts
  USING (user_id = auth.uid());
-- (repetir para transactions, budgets, goals, etc.)
```

**Trigger: criar perfil automaticamente ao registrar:**

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Função SQL para atualizar saldo da conta automaticamente:**

```sql
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE accounts SET balance = balance +
      CASE NEW.type
        WHEN 'INCOME'   THEN NEW.amount
        WHEN 'EXPENSE'  THEN -NEW.amount
        WHEN 'TRANSFER' THEN -NEW.amount  -- trata a saída; a entrada é outra transação
      END
    WHERE id = NEW.account_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE accounts SET balance = balance -
      CASE OLD.type
        WHEN 'INCOME'   THEN OLD.amount
        WHEN 'EXPENSE'  THEN -OLD.amount
        WHEN 'TRANSFER' THEN -OLD.amount
      END
    WHERE id = OLD.account_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.amount != NEW.amount THEN
    -- reverte o antigo e aplica o novo
    UPDATE accounts SET balance = balance -
      CASE OLD.type WHEN 'INCOME' THEN OLD.amount ELSE -OLD.amount END
      + CASE NEW.type WHEN 'INCOME' THEN NEW.amount ELSE -NEW.amount END
    WHERE id = NEW.account_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_balance
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_account_balance();
```

---

## 2. Sistema de Autenticação & Onboarding

### 2.1 Autenticação

**Biblioteca:** NextAuth.js v5 (Auth.js) com adaptador Prisma

**Providers suportados:**
- Email/senha (com hashing bcrypt)
- Google OAuth
- GitHub OAuth (opcional)
- Magic Link por email (Resend)

**Fluxo:**
```
/login → credenciais → JWT session (httpOnly cookie)
       → OAuth callback → create or link account → /onboarding ou /dashboard
```

**Componentes:**
- `LoginForm` — campos email + senha, botões OAuth, link "esqueci senha"
- `RegisterForm` — nome, email, senha, confirmação
- `ForgotPasswordForm` — email → envia magic link
- `ResetPasswordForm` — nova senha com validação de força em tempo real

**Segurança:**
- Rate limiting via middleware Next.js (máx 5 tentativas/min por IP)
- CSRF protection nativo do Auth.js
- Sessão com refresh automático (sliding window)

---

### 2.2 Onboarding (3 etapas com progress bar animada)

**Etapa 1 — Perfil Financeiro**
- Renda mensal líquida (input com máscara monetária `pt-BR`)
- Principal objetivo financeiro (chips selecionáveis: "Sair das dívidas", "Construir reserva", "Investir", "Comprar imóvel", "Viajar")
- Experiência com finanças (Iniciante / Intermediário / Avançado) → calibra tom da Zara

**Etapa 2 — Primeira Conta**
- Nome da conta (ex: "Nubank Conta")
- Tipo: Corrente / Poupança / Cartão de Crédito / Carteira em Dinheiro
- Saldo atual
- Cor de identificação (color picker com paleta curada)

**Etapa 3 — Primeira Meta (opcional, pode pular)**
- Nome da meta
- Valor alvo
- Data limite
- Ícone (emoji picker com busca)

**Ao finalizar:**
- Criar registros no banco
- Injetar contexto na Zara: primeira mensagem de boas-vindas personalizada com nome, objetivo e saldo
- Redirecionar para `/dashboard` com animação de entrada

---

## 3. Dashboard Principal — Expansão

### 3.1 Layout e Grid

```
┌─────────────────────────────────────────────────────────┐
│  TopBar: saudação + data + avatar + notificações        │
├──────────┬──────────────────────────────────────────────┤
│ Sidebar  │  [Saldo Total]  [Receitas]  [Despesas]       │
│          ├──────────────────────────────────────────────┤
│          │  Fluxo de Caixa (área chart — 30/60/90d)     │
│          ├─────────────────────┬────────────────────────┤
│          │  Orçamentos         │  Metas                 │
│          │  (progress bars)    │  (mini cards)          │
│          ├─────────────────────┴────────────────────────┤
│          │  Transações Recentes      Calendário Fin.    │
└──────────┴──────────────────────────────────────────────┘
```

### 3.2 Cards de KPI (topo)

**Componente: `KPICard`**

Propriedades por card:
| Card | Valor | Detalhe | Trend |
|------|-------|---------|-------|
| Saldo Total | Soma de todas as contas | Variação vs. mês anterior | ↑↓ % |
| Receitas do Mês | Total de entradas | Meta de receita (se definida) | ↑↓ % |
| Despesas do Mês | Total de saídas | % da renda comprometida | ↑↓ % |
| Saldo do Mês | Receitas − Despesas | "Sobrou" / "Faltou" | visual semáforo |

**Animação:** Valores trocam com o efeito split-flap já existente no projeto (reutilizar CSS 3D atual).

**Interação:** Clicar no card de Despesas abre modal com breakdown por categoria; clicar em Receitas abre filtro de receitas no módulo de transações.

---

### 3.3 Gráfico de Fluxo de Caixa

**Componente: `CashFlowChart`** (Recharts `AreaChart` já existente)

**Expansões:**
- Toggle de período: 7d / 30d / 3m / 6m / 12m / Personalizado
- Modo de exibição: Linha suavizada (curveMonotoneX) ou Barras agrupadas
- Tooltip enriquecido: ao hover, exibe receitas + despesas + saldo líquido do dia/semana
- Zoom: arrastar para selecionar um intervalo (recharts Brush component)
- Anotações: marcar pontos de transações recorrentes com ícone no eixo X

---

### 3.4 Donut Chart — Gastos por Categoria

**Componente: `SpendingBreakdown`**

- Categorias com cores definidas no banco
- Centro do donut: valor total gasto
- Legenda clicável: filtrar/destacar fatia
- Botão "Ver detalhes" → navega para `/relatorios` com filtro pré-aplicado
- Fallback: se sem dados, exibir ilustração SVG + CTA para adicionar transação

---

### 3.5 Widget de Orçamentos

**Componente: `BudgetOverview`**

Para cada orçamento ativo do mês:
- Barra de progresso animada com gradiente (verde → amarelo → vermelho conforme %)
- Valor gasto / Limite
- % restante em badge
- Alerta visual se ultrapassar 80% (pulse animation)
- Clicar expande mini-lista com últimas transações da categoria

---

### 3.6 Widget de Metas

**Componente: `GoalsOverview`**

- Cards horizontais com scroll snap (mobile-first)
- Ícone + Nome + Barra de progresso circular (SVG stroke-dasharray)
- Valor atual / Alvo + dias restantes
- Botão "Depositar" → modal rápido para adicionar valor à meta
- Badge "Concluída 🎉" com confetti animation quando atingir 100%

---

### 3.7 Feed de Transações Recentes

**Componente: `RecentTransactions`**

- Últimas 8 transações
- Agrupadas por data (Hoje / Ontem / DD/MM)
- Ícone de categoria + descrição + conta + valor colorido (verde/vermelho)
- Ação rápida: swipe left (mobile) ou hover button para editar/excluir
- Link "Ver todas" → `/transacoes`

---

### 3.8 Calendário Financeiro

**Componente: `FinancialCalendar`**

- Visualização mensal compacta (mini calendar)
- Dias com transações recebem ponto colorido (receita = verde, despesa = vermelho)
- Dias futuros com recorrências recebem ponto tracejado
- Clicar em um dia abre popover com transações do dia
- Destaque do dia atual
- Navegação mês anterior/próximo

---

### 3.9 Sidebar de Navegação

**Componente: `Sidebar`**

```
Logo / Nome do App
─────────────────
[Avatar + Nome + Saldo rápido]
─────────────────
▶ Dashboard
  Transações
  Orçamentos
  Metas
  Contas
  Recorrências
  Relatórios
─────────────────
  Configurações
  Sair
─────────────────
[Plano atual: Free/Pro badge]
```

**Comportamento:**
- Colapsável (ícone apenas) com animação suave `width` transition
- Estado persistido em localStorage
- Em mobile: drawer bottom sheet (ao invés de sidebar lateral)
- Indicador de rota ativa com borda left e background sutil
- Tooltip nos ícones quando colapsada

---

## 4. Módulo de Transações

### 4.1 Listagem Principal

**Rota:** `/transacoes`

**Layout:**

```
[Barra de busca]  [Filtros ▾]  [+ Nova Transação]  [Exportar ▾]
─────────────────────────────────────────────────────────────────
Resumo do período: Receitas | Despesas | Saldo
─────────────────────────────────────────────────────────────────
Hoje — 02/08/2025
  🛒 Supermercado Extra    Nubank    − R$ 187,50
  💰 Salário               Inter     + R$ 5.200,00

Ontem — 01/08/2025
  🎬 Netflix               Crédito   − R$ 44,90
  ...
```

**Filtros disponíveis (panel lateral ou dropdown):**
- Período: data inicial / data final (date range picker)
- Tipo: Receita / Despesa / Transferência
- Categorias (multi-select com ícones)
- Contas (multi-select)
- Tags (multi-select)
- Valor mínimo / máximo (range slider)
- Status: Confirmada / Pendente

**Ordenação:** Data (desc/asc) / Valor / Categoria / Conta

**Paginação:** Infinite scroll com Intersection Observer (carregar 30 por vez)

---

### 4.2 Modal de Nova Transação / Edição

**Componente: `TransactionModal`** (sheet lateral no desktop, bottom sheet no mobile)

**Campos:**
```
Tipo: [Despesa] [Receita] [Transferência]  ← toggle com cores
Valor: R$ ____________ (input grande, teclado numérico no mobile)
Descrição: _____________
Categoria: [ícone] Alimentação ▾  (searchable select com ícones)
Subcategoria: Restaurante ▾
Data: 02/08/2025  (date picker com calendário)
Conta: Nubank ▾
Parcelado? ○ Não  ● Sim → [3] parcelas
Recorrente? ○ Não  ● Sim → Mensal ▾
Tags: [férias] [pessoal] [+ adicionar]
Notas: _____________
Anexo: [📎 Comprovante]
```

**Para Transferência:**
- Conta origem ▾ → Conta destino ▾
- Valor (debitado de origem e creditado no destino automaticamente)

**Validações em tempo real (Zod):**
- Valor obrigatório, maior que 0
- Descrição mínima de 2 caracteres
- Data não pode ser mais de 1 ano no futuro
- Conta obrigatória

**Atalhos de teclado:**
- `T` → abre modal de nova transação
- `Escape` → fecha modal
- `Enter` → salva (quando formulário válido)

---

### 4.3 Categorias de Transações

**Categorias padrão (expansíveis pelo usuário):**

| Ícone | Categoria | Subcategorias |
|-------|-----------|---------------|
| 🛒 | Alimentação | Supermercado, Restaurante, Delivery, Padaria, Feira |
| 🏠 | Moradia | Aluguel, Condomínio, Água, Luz, Gás, Internet, IPTU |
| 🚗 | Transporte | Combustível, Uber/99, Ônibus/Metrô, Estacionamento, Manutenção |
| ❤️ | Saúde | Consulta, Farmácia, Plano de Saúde, Academia, Exames |
| 📚 | Educação | Cursos, Livros, Escola, Faculdade |
| 🎮 | Lazer | Streaming, Cinema, Jogos, Viagens, Restaurantes |
| 👗 | Vestuário | Roupas, Calçados, Acessórios |
| 💄 | Beleza | Salão, Barbearia, Cosméticos |
| 🐾 | Pet | Ração, Vet, Banho e Tosa |
| 📱 | Tecnologia | Celular, Software, Gadgets |
| 💰 | Renda | Salário, Freelance, Investimentos, Aluguel Recebido |
| 🏦 | Financeiro | Juros, IOF, Tarifa Bancária, Seguro |
| 🎁 | Presente | Aniversário, Casamento, Outros |
| 📦 | Outros | Genérico |

**Gerenciamento:** `/configuracoes/categorias` → criar, editar ícone/cor/nome, arquivar

---

### 4.4 Importação de Extratos

**Formatos suportados:** OFX (padrão bancário BR), CSV, XLSX

**Fluxo:**
1. Upload do arquivo (drag-and-drop ou click)
2. Parsing client-side (papaparse para CSV/XLSX, parser custom para OFX)
3. Preview: tabela editável com campos mapeados
4. Detecção automática de duplicatas (hash por data+valor+descrição)
5. Sugestão de categoria via IA (Zara analisa descrição e sugere)
6. Confirmar importação → salvar lote

---

### 4.5 Exportação

**Formatos:** CSV, XLSX, PDF (relatório formatado)

**Filtros da exportação:** os mesmos da listagem + opção de incluir/excluir colunas

---

## 5. Módulo de Orçamentos (Budgets)

### 5.1 Listagem de Orçamentos

**Rota:** `/orcamentos`

**Layout cards:**
```
┌─────────────────────────────┐
│ 🛒 Alimentação              │
│ R$ 780 / R$ 1.000           │
│ ████████████░░░░  78%       │
│ Faltam R$ 220 | 8 dias      │
│ [Editar]  [Histórico]       │
└─────────────────────────────┘
```

**Modos de visualização:** Cards / Lista / Comparativo por mês

**Header da página:**
- Mês/Ano atual com navegação ◀ ▶
- Total orçado vs. Total gasto (KPI resumo)
- Botão "Novo Orçamento"

---

### 5.2 Modal de Novo Orçamento

```
Categoria: [🛒 Alimentação] ▾
Limite mensal: R$ ________
Período: Mensal ▾  (Mensal / Semanal / Anual)
Alertar em: [80]% do limite
Cor: ●●●●●●  (paleta)
Rollover? ◉ Não  ○ Sim (saldo não usado vai para próximo mês)
```

---

### 5.3 Histórico de Orçamento

**Componente: `BudgetHistory`**

- Gráfico de barras: valor gasto por mês (últimos 6 meses)
- Linha tracejada: limite do orçamento
- Percentual médio de uso
- Meses em que ultrapassou (destacados em vermelho)

---

### 5.4 Alertas Inteligentes de Orçamento

Quando usuário atingir o percentual de alerta:
- Notificação push/email: "Você usou 80% do orçamento de Alimentação"
- Badge vermelho na sidebar em `/orcamentos`
- Zara comenta proativamente: "Notei que você está perto do limite de alimentação..."

---

## 6. Módulo de Metas Financeiras

### 6.1 Listagem de Metas

**Rota:** `/metas`

**Layout:**
```
┌─────────────────────────────────────┐
│   ✈️ Viagem para Europa             │
│   R$ 3.200 / R$ 8.000              │
│        ○ 40%                        │
│   Faltam R$ 4.800 · 6 meses        │
│   Ritmo necessário: R$ 800/mês      │
│   [Depositar]  [Detalhes]           │
└─────────────────────────────────────┘
```

**Categorias visuais de metas:**
- 🆘 Reserva de Emergência
- ✈️ Viagem
- 🏠 Imóvel
- 🚗 Veículo
- 📚 Educação
- 💰 Investimento
- 🎁 Outro

---

### 6.2 Detalhes de uma Meta

**Rota:** `/metas/[id]`

- Gráfico de linha: evolução do saldo ao longo do tempo
- Linha de projeção: se manter o ritmo atual, quando vai atingir?
- Histórico de depósitos (tabela)
- "Quanto depositar por mês para atingir até [data]?" — cálculo automático
- Sugestões da Zara: "Se cortar R$ 100 de lazer, você atinge em 2 meses a menos"

---

### 6.3 Modal de Depósito em Meta

```
Meta: ✈️ Viagem para Europa
Atual: R$ 3.200 / R$ 8.000

Valor a depositar: R$ ________
Conta de origem: [Nubank] ▾
Data: hoje ▾

[Depositar]
```

---

### 6.4 Meta de Reserva de Emergência

**Feature especial:** card com cálculo automático:
- Recomendação: 6x a despesa mensal média
- Progresso em meses de cobertura (ex: "Você tem 2,4 meses de reserva")
- Meta sugerida calculada automaticamente na criação

---

## 7. Módulo de Contas & Carteiras

### 7.1 Visão Geral

**Rota:** `/contas`

```
Patrimônio Líquido: R$ 24.380,00
─────────────────────────────────

Conta Corrente
  💳 Nubank           R$ 3.420,00   [default]
  🏦 Itaú             R$ 1.200,00

Poupança
  🐷 Caixa Poupança   R$ 8.600,00

Investimentos
  📈 Rico / XP        R$ 10.500,00

Cartão de Crédito
  💳 Nubank Crédito   − R$ 1.340,00  Fecha dia 19 · Vence dia 26

Carteira
  💵 Dinheiro físico  R$ 0,00
```

---

### 7.2 Card de Conta

- Cor e ícone do banco
- Saldo com toggle de visibilidade (olho)
- Últimas 3 transações da conta
- Botão "Ver extrato" → `/transacoes?conta=id`
- Para cartão de crédito: data de fechamento, vencimento, limite total/disponível

---

### 7.3 Modal de Nova Conta

```
Tipo: [Corrente] [Poupança] [Crédito] [Investimento] [Carteira]
Nome: _____________
Banco: [pesquisar banco] ▾  (lista com logos dos bancos BR)
Saldo inicial: R$ ________
Cor: ●●●●●
Ícone: 🏦
Conta padrão? □

--- Se Crédito ---
Limite: R$ ________
Dia de fechamento: [19]
Dia de vencimento: [26]
```

---

### 7.4 Transferência entre Contas

**Ação rápida no card de conta ou via modal de transação (tipo Transferência)**

- Conta origem → Conta destino
- Valor
- Data
- Notas

Registra automaticamente como saída na origem e entrada no destino, sem afetar receitas/despesas totais.

---

## 8. Módulo de Relatórios & Analytics

### 8.1 Página Principal

**Rota:** `/relatorios`

**Seções:**

**8.1.1 Resumo Mensal**
- Receitas vs. Despesas vs. Saldo (3 colunas)
- Comparativo com mês anterior (% de variação)
- Taxa de poupança: (Receitas − Despesas) / Receitas × 100

**8.1.2 Gastos por Categoria**
- Donut chart interativo
- Tabela com: Categoria / Valor / % do total / Variação vs. mês anterior
- Drill-down: clicar em categoria lista as transações

**8.1.3 Evolução Patrimonial**
- Gráfico de área: saldo total de todas as contas ao longo do tempo
- Marcos: meses positivos (verde) vs. negativos (vermelho)

**8.1.4 Análise de Gastos Recorrentes**
- Proporção do orçamento em despesas fixas vs. variáveis
- Projeção do próximo mês baseada nos recorrentes ativos

**8.1.5 Heatmap de Gastos**
- Calendário tipo GitHub heatmap
- Quanto mais gasto no dia, mais escura a cor
- Útil para ver padrões (finais de semana, início/fim de mês)

**8.1.6 Comparativo por Período**
- Selecionar até 3 meses para comparar lado a lado
- Barras agrupadas por categoria

---

### 8.2 Relatório PDF

**Gerado via:** jsPDF ou Puppeteer serverless

**Conteúdo:**
- Capa com nome + período
- Resumo executivo (KPIs)
- Gráficos exportados como imagem
- Tabela de transações
- Insights da Zara para o período

---

## 9. Módulo de Recorrências & Assinaturas

### 9.1 Listagem

**Rota:** `/recorrencias`

**Seções:**
- **Próximas a vencer (7 dias)** — highlight amarelo
- **Recorrentes do mês** — lista completa
- **Assinaturas ativas** — sub-seção para streaming, software, etc.

**Card de recorrência:**
```
📺 Netflix
R$ 44,90 · Todo dia 15
Próximo: 15/08  · Conta: Crédito Nubank
[Editar]  [Pausar]  [Excluir]
```

---

### 9.2 Modal de Nova Recorrência

```
Descrição: _____________
Valor: R$ ________
Tipo: [Despesa] [Receita]
Categoria: ▾
Conta: ▾
Frequência: [Mensal] [Semanal] [Anual] [Quinzenal]
Dia: [15]
Início: ________
Fim: ________ (opcional)
Gerar automaticamente? ◉ Sim  ○ Não (aprovação manual)
```

---

### 9.3 Processamento Automático

**CRON Job** (via Vercel Cron ou GitHub Actions):
- Executa diariamente às 06:00 BRT
- Para cada recorrência com `nextDueDate <= hoje`:
  - Cria a transação automaticamente
  - Atualiza `nextDueDate` para o próximo período
  - Envia notificação ao usuário

---

### 9.4 Previsão de Fluxo de Caixa

**Componente: `CashFlowForecast`**

- Gráfico dos próximos 30/60/90 dias
- Saldo atual como ponto de partida
- Linhas projetadas com base nas recorrências ativas
- Identifica dias/semanas com saldo negativo projetado
- Alerta Zara: "Em 23/08 você pode ter saldo negativo de R$ 380"

---

## 10. Assistente Zara — Expansão de Capacidades

### 10.1 Contexto Injetado na API

```typescript
// /api/chat/route.ts
const financialContext = {
  user: {
    name: user.name,
    monthlyIncome: user.monthlyIncome,
    currency: "BRL",
    locale: "pt-BR",
  },
  currentMonth: {
    totalIncome: ...,
    totalExpenses: ...,
    balance: ...,
    savingsRate: ...,
  },
  accounts: accounts.map(a => ({ name: a.name, type: a.type, balance: a.balance })),
  topCategories: topSpendingCategories,        // top 5 com valores
  budgets: budgets.map(b => ({
    category: b.category,
    limit: b.limit,
    spent: b.spent,
    percentUsed: b.percentUsed,
  })),
  goals: goals.map(g => ({
    name: g.name,
    target: g.targetAmount,
    saved: g.savedAmount,
    deadline: g.deadline,
  })),
  upcomingRecurrences: nextRecurrences,        // próximos 7 dias
  recentTransactions: last10Transactions,
};

const systemPrompt = `
Você é Zara, assistente financeira pessoal da [App]. Você é empática, 
direta, sem jargões desnecessários e sempre orientada à ação.
Você tem acesso ao contexto financeiro real do usuário.
Nunca invente dados. Se não souber algo, diga.
Responda sempre em português do Brasil.

CONTEXTO FINANCEIRO DO USUÁRIO:
${JSON.stringify(financialContext, null, 2)}
`;
```

---

### 10.2 Capacidades da Zara

**Consulta de dados:**
- "Quanto gastei com alimentação este mês?" → busca e responde com dado real
- "Qual meu saldo total?" → soma todas as contas
- "Quando vence meu cartão Nubank?" → busca na conta de crédito
- "Quais assinaturas tenho ativas?" → lista recorrências categoria streaming/software

**Análise e insight:**
- "Estou gastando demais?" → compara com renda e meses anteriores
- "O que posso cortar para economizar R$ 500?" → analisa variáveis e sugere categorias
- "Quando vou atingir minha meta de viagem?" → calcula projeção

**Ações via comando:**
- "Adicionar despesa de R$ 50 no iFood" → preenche modal de transação automaticamente (não salva sem confirmação do usuário)
- "Criar orçamento de R$ 300 para lazer" → abre modal pré-preenchido
- "Quanto sobrou hoje?" → cálculo em tempo real

**Educação financeira:**
- "O que é taxa Selic?" → explica de forma simples + contexto do impacto nas finanças do usuário
- "Como funciona o CDI?" → explicação didática

---

### 10.3 Interface do AgentDock — Melhorias

**Estado atual:** Dock flutuante no canto inferior direito

**Melhorias:**

**10.3.1 Histórico de conversa persistido**
- Salvar mensagens no banco (tabela `ChatMessage`)
- Carregar últimas 20 mensagens ao abrir
- Botão "Limpar conversa"

**10.3.2 Mensagens de boas-vindas contextuais**
- Manhã (06-12h): "Bom dia, [Nome]! Você tem R$ X em conta. Hoje vence [recorrência]."
- Tarde (12-18h): "Boa tarde! Você já gastou R$ X hoje."
- Noite (18-24h): "Boa noite! Resumo do dia: [receitas] entrada, [despesas] saída."

**10.3.3 Sugestões rápidas (chips)**
- Botões abaixo do input com perguntas frequentes:
  - "Ver saldo"
  - "Adicionar gasto"
  - "Análise do mês"
  - "Próximas contas"

**10.3.4 Modo expandido**
- Botão para maximizar o dock em painel lateral full-height
- Melhor para conversas longas ou análises

**10.3.5 Feedback de resposta**
- 👍 / 👎 em cada resposta da Zara
- Log para melhoria contínua do sistema prompt

**10.3.6 Indicador de "pensando"**
- Quando `reasoning_budget` estiver ativo, exibir indicador diferenciado: "Zara está analisando..."
- Animação de bolha pulsante durante streaming

**10.3.7 Respostas com cards estruturados**
- Quando Zara responder com lista de transações → renderizar mini-tabela inline
- Quando responder com orçamentos → mini progress bars inline
- Suporte a markdown: **negrito**, _itálico_, listas

---

### 10.4 Voz — Melhorias da Web Speech API

**Input por voz (já existente):**
- Feedback visual de amplitude: ondas SVG animadas enquanto grava
- Transcrição em tempo real exibida no input antes de enviar
- Cancelar com `Escape` durante gravação

**Output por voz (novo — TTS):**
- Web Speech API `SpeechSynthesis` para ler resposta da Zara
- Botão 🔊 em cada mensagem para ouvir
- Voz selecionada: `pt-BR` com pitch e rate ajustados
- Toggle global: ativar/desativar TTS nas configurações

---

## 11. Sistema de Notificações & Alertas

### 11.1 Tipos de Alertas

| Trigger | Mensagem | Canal |
|---------|----------|-------|
| Orçamento > 80% | "Você usou 80% do orçamento de [categoria]" | Push + In-app |
| Orçamento > 100% | "Orçamento de [categoria] estourado!" | Push + Email |
| Recorrência vencendo | "[Descrição] vence amanhã (R$ X)" | Push + In-app |
| Meta atingida | "🎉 Você atingiu sua meta [nome]!" | Push + Email |
| Saldo baixo | "Saldo em [conta] está abaixo de R$ [threshold]" | Push |
| Meta quase lá | "Você está a 90% da meta [nome]!" | In-app |
| Semana negativa | "Esta semana você gastou mais do que recebeu" | Email semanal |
| Relatório mensal | "Seu resumo de [mês] está pronto" | Email |

### 11.2 Implementação

**Push Notifications:** Web Push API via service worker
- Permissão solicitada após 3 dias de uso (não na primeira visita)
- Configurável: quais alertas o usuário quer receber

**Email:** Resend + React Email para templates HTML bonitos

**In-app:** Componente `NotificationCenter` (ícone na topbar)
- Badge com contagem de não lidas
- Dropdown com lista de notificações
- Marcar todas como lidas
- Notificação toast (Sonner) para ações em tempo real

### 11.3 Configurações de Alertas

Em `/configuracoes/alertas`:
- Toggle por tipo de alerta
- Configurar threshold de saldo baixo
- Frequência de relatórios por email (semanal / mensal / nunca)
- Horário das notificações (não perturbe: 22h-08h)

---

## 12. Configurações & Perfil do Usuário

### 12.1 Seções

**Rota:** `/configuracoes`

```
/configuracoes
  ├── perfil         → Nome, email, avatar, senha
  ├── financeiro     → Renda, moeda, dia de fechamento do mês
  ├── categorias     → CRUD de categorias e subcategorias
  ├── alertas        → Configurar notificações
  ├── aparencia      → Tema claro/escuro, cor de destaque
  ├── zara           → Tom da Zara, idioma, TTS on/off
  ├── privacidade    → Exportar dados, excluir conta
  └── plano          → Ver plano atual, upgrade
```

### 12.2 Configurações Financeiras

- Moeda padrão (BRL, USD, EUR, GBP)
- Locale para formatação (pt-BR, en-US, etc.)
- Renda mensal líquida (atualizar)
- Dia de início do mês financeiro (padrão: 1; alguns usam dia do salário, ex: 5)
- Método de orçamento: 50/30/20 automático ou manual

### 12.3 Regra 50/30/20 Automática

Se ativada, o sistema sugere orçamentos baseados na renda:
- 50% para necessidades (Moradia, Alimentação, Saúde, Transporte)
- 30% para desejos (Lazer, Restaurante, Streaming, Shopping)
- 20% para poupança/metas

Usuário pode aceitar sugestão ou ajustar manualmente.

### 12.4 Aparência

- **Tema:** Claro / Escuro / Seguir sistema
- **Cor de destaque:** picker com paleta curada (azul, verde, roxo, laranja, rosa)
- **Densidade:** Compacto / Normal / Confortável (afeta padding e tamanho de fonte)
- **Animações:** Ativar/desativar (acessibilidade)

---

## 13. Infraestrutura de Dados & API Routes

### 13.1 API Routes Detalhadas

```
GET    /api/transactions          → listar com filtros + paginação
POST   /api/transactions          → criar transação
GET    /api/transactions/:id      → detalhe
PUT    /api/transactions/:id      → editar
DELETE /api/transactions/:id      → excluir
POST   /api/transactions/import   → importar lote (OFX/CSV)
GET    /api/transactions/export   → exportar com filtros

GET    /api/budgets               → listar orçamentos do mês
POST   /api/budgets               → criar
PUT    /api/budgets/:id           → editar
DELETE /api/budgets/:id           → excluir

GET    /api/goals                 → listar metas
POST   /api/goals                 → criar
PUT    /api/goals/:id             → editar
POST   /api/goals/:id/deposit     → depositar valor na meta
DELETE /api/goals/:id             → excluir

GET    /api/accounts              → listar contas
POST   /api/accounts              → criar
PUT    /api/accounts/:id          → editar
DELETE /api/accounts/:id          → excluir

GET    /api/reports/monthly       → resumo mensal
GET    /api/reports/categories    → breakdown por categoria
GET    /api/reports/evolution     → evolução patrimonial
GET    /api/reports/forecast      → previsão de fluxo de caixa

GET    /api/recurrences           → listar recorrências
POST   /api/recurrences           → criar
PUT    /api/recurrences/:id       → editar
DELETE /api/recurrences/:id       → excluir
POST   /api/recurrences/process   → processar vencidas (cron)

POST   /api/chat                  → Zara AI (streaming SSE)

POST   /api/webhooks/cron         → endpoint do cron job diário
```

### 13.2 Padrão de Resposta da API

```typescript
// Sucesso
{
  success: true,
  data: T,
  meta?: { page: number, total: number, hasMore: boolean }
}

// Erro
{
  success: false,
  error: {
    code: "VALIDATION_ERROR" | "NOT_FOUND" | "UNAUTHORIZED" | ...,
    message: "Descrição amigável",
    details?: ZodError[]
  }
}
```

### 13.3 Middleware de Autenticação

```typescript
// middleware.ts
export const config = {
  matcher: ["/dashboard/:path*", "/api/((?!auth|webhooks).*)"],
};

// Verifica sessão → redireciona para /login se não autenticado
// Verifica rate limiting para /api/chat (20 req/min por usuário)
```

### 13.4 Zustand Stores

```typescript
// store/useFinanceStore.ts
interface FinanceStore {
  // Estado
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  recurrences: Recurrence[];
  
  // KPIs calculados
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  
  // Actions
  fetchAll: () => Promise<void>;
  addTransaction: (t: CreateTransactionDTO) => Promise<void>;
  updateTransaction: (id: string, t: UpdateTransactionDTO) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  // ... outros
}

// store/useChatStore.ts
interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  isOpen: boolean;
  isExpanded: boolean;
  
  sendMessage: (content: string) => Promise<void>;
  toggleOpen: () => void;
  toggleExpanded: () => void;
  clearHistory: () => void;
}

// store/useUIStore.ts
interface UIStore {
  theme: "light" | "dark" | "system";
  sidebarCollapsed: boolean;
  activePeriod: Period;
  notifications: Notification[];
  // ...
}
```

---

## 14. Design System & Componentes Atômicos

### 14.1 Tokens de Design (CSS Variables)

```css
/* globals.css */
:root {
  /* Cores base */
  --color-income: hsl(142, 71%, 45%);      /* Verde */
  --color-expense: hsl(0, 84%, 60%);        /* Vermelho */
  --color-transfer: hsl(217, 91%, 60%);     /* Azul */
  --color-saving: hsl(262, 83%, 58%);       /* Roxo */
  
  /* Semáforo de orçamento */
  --color-budget-safe: hsl(142, 71%, 45%);
  --color-budget-warning: hsl(38, 92%, 50%);
  --color-budget-danger: hsl(0, 84%, 60%);
  
  /* Gradientes */
  --gradient-income: linear-gradient(135deg, hsl(142, 71%, 45%), hsl(158, 64%, 52%));
  --gradient-expense: linear-gradient(135deg, hsl(0, 84%, 60%), hsl(15, 86%, 55%));
}
```

### 14.2 Componentes Compartilhados

**`CurrencyDisplay`**
```tsx
<CurrencyDisplay 
  value={1234.56} 
  size="lg"           // sm | md | lg | xl
  masked={isMasked}   // modo privacidade
  trend={5.2}         // % para exibir ↑↓
/>
```

**`CategoryBadge`**
```tsx
<CategoryBadge 
  category="Alimentação" 
  icon="🛒"
  color="#22c55e"
  size="sm"
/>
```

**`ProgressRing`** (SVG circular para metas)
```tsx
<ProgressRing 
  value={40}      // 0-100
  size={80}       // px
  strokeWidth={8}
  color="var(--color-saving)"
/>
```

**`TransactionItem`**
```tsx
<TransactionItem
  transaction={t}
  onEdit={() => openEditModal(t.id)}
  onDelete={() => deleteTransaction(t.id)}
/>
```

**`EmptyState`**
```tsx
<EmptyState
  illustration="no-transactions"
  title="Nenhuma transação"
  description="Adicione sua primeira transação para começar"
  action={{ label: "Adicionar transação", onClick: openModal }}
/>
```

**`DateRangePicker`**
- Calendário duplo para seleção de período
- Atalhos rápidos: Esta semana / Este mês / Últimos 30 dias / Este ano

**`MoneyInput`**
- Máscara automática: `R$ 1.234,56`
- Aceita digitação natural (sem formatar enquanto digita, formata no blur)
- Suporte a valores negativos

---

## 15. Performance, Acessibilidade & SEO

### 15.1 Performance

**Code Splitting:**
- Cada módulo (relatórios, metas, etc.) carregado via `next/dynamic`
- Recharts carregado só nas páginas que usam gráficos

**Otimização de dados:**
- SWR ou TanStack Query para cache de requisições no cliente
- Revalidação otimista: UI atualiza antes da confirmação do servidor
- Suspense boundaries com skeletons específicos por componente

**Bundle:**
- Analisar com `@next/bundle-analyzer`
- Target: First Contentful Paint < 1.5s em 3G

**Imagens:**
- Logos de bancos: SVG inline
- Avatar: `next/image` com blur placeholder

---

### 15.2 Acessibilidade (WCAG 2.1 AA)

- Todos os inputs com `label` associado
- Cores com contraste mínimo 4.5:1
- Navegação completa por teclado (Tab, Enter, Space, Escape, Arrow keys)
- `aria-live` nos toasts e mensagens da Zara
- `aria-label` em botões com apenas ícone
- Foco visível com outline customizado (não remover o outline, estilizar)
- Skeleton loaders com `aria-busy="true"`
- Textos alternativos nos gráficos (tabelas ocultas visualmente com dados)
- Modo de alto contraste via media query `prefers-contrast`
- Respeitar `prefers-reduced-motion` — desativar animações split-flap e transições

---

### 15.3 Responsividade

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Adaptações mobile:**
- Sidebar → Bottom Navigation Bar (4 ícones principais)
- Cards de KPI → scroll horizontal snap
- Modais → bottom sheets (full-width, deslizar para fechar)
- AgentDock → tela cheia no mobile
- Tabelas → cards verticais ou scroll horizontal

---

## 16. Roadmap por Sprints

> Cada sprint = 2 semanas. Time solo ou pequeno: ajustar escopo conforme velocidade.

---

### Sprint 1 — Fundação (Semanas 1-2)

**Objetivo:** App funcional com CRUD básico

- [ ] Setup Prisma + PostgreSQL (Neon)
- [ ] Schema completo do banco de dados
- [ ] NextAuth.js v5 com Email/Senha + Google OAuth
- [ ] Zustand stores básicos
- [ ] API Routes: `transactions` CRUD
- [ ] Sidebar de navegação + TopBar
- [ ] Módulo de Contas: listagem + modal de criação
- [ ] Modal de Nova Transação (versão simples)
- [ ] Feed de transações recentes

**Entregável:** Usuário consegue criar conta, adicionar contas bancárias e lançar transações.

---

### Sprint 2 — Dashboard & KPIs (Semanas 3-4)

**Objetivo:** Dashboard rico com dados reais

- [ ] KPI Cards com animação split-flap (valores reais)
- [ ] Gráfico de Fluxo de Caixa (dados reais + toggle de período)
- [ ] Donut Chart de gastos por categoria
- [ ] Calendário Financeiro
- [ ] Listagem completa de transações com filtros
- [ ] Categorias padrão no banco (seed)
- [ ] Sistema de tags
- [ ] Importação CSV básica

**Entregável:** Dashboard completo. Usuário tem visão clara das finanças.

---

### Sprint 3 — Orçamentos & Metas (Semanas 5-6)

**Objetivo:** Planejamento financeiro

- [ ] API Routes: `budgets` e `goals` CRUD
- [ ] Módulo de Orçamentos completo
- [ ] Alertas de orçamento (in-app)
- [ ] Módulo de Metas completo
- [ ] Modal de depósito em meta
- [ ] Projeção de data de conclusão da meta
- [ ] Widget de orçamentos no dashboard
- [ ] Widget de metas no dashboard

**Entregável:** Usuário define orçamentos e acompanha metas financeiras.

---

### Sprint 4 — Recorrências & Notificações (Semanas 7-8)

**Objetivo:** Automatização e alertas

- [ ] API Routes: `recurrences` CRUD
- [ ] CRON Job diário para processar recorrências
- [ ] Módulo de Recorrências completo
- [ ] Previsão de fluxo de caixa (30/60/90d)
- [ ] Sistema de notificações in-app (`NotificationCenter`)
- [ ] Push Notifications (service worker)
- [ ] Emails transacionais (Resend + React Email)
- [ ] Configurações de alertas

**Entregável:** Usuário recebe alertas proativos e tem contas recorrentes automáticas.

---

### Sprint 5 — Zara Expandida (Semanas 9-10)

**Objetivo:** IA como diferencial do produto

- [ ] Contexto financeiro completo injetado na Zara
- [ ] Histórico de chat persistido no banco
- [ ] Mensagens de boas-vindas contextuais
- [ ] Chips de sugestões rápidas
- [ ] Modo expandido do AgentDock
- [ ] TTS (Web Speech API SpeechSynthesis)
- [ ] Cards estruturados nas respostas (mini-tabelas, progress bars)
- [ ] Ação por comando: preencher modal de transação via Zara
- [ ] Feedback 👍/👎 nas respostas

**Entregável:** Zara é genuinamente útil e contextual para o usuário.

---

### Sprint 6 — Relatórios & Analytics (Semanas 11-12)

**Objetivo:** Inteligência analítica

- [ ] Módulo de Relatórios completo
- [ ] Heatmap de gastos
- [ ] Comparativo por período (até 3 meses)
- [ ] Evolução patrimonial
- [ ] Exportação de relatório PDF
- [ ] Importação OFX (bancos BR)
- [ ] Análise de gastos recorrentes

**Entregável:** Usuário tem visão analítica profunda das finanças.

---

### Sprint 7 — Onboarding & Polimento (Semanas 13-14)

**Objetivo:** Experiência de primeiro uso impecável

- [ ] Fluxo de onboarding (3 etapas)
- [ ] Regra 50/30/20 automática
- [ ] Estados vazios com ilustrações
- [ ] Skeletons em todos os componentes
- [ ] Modo de privacidade (mascarar valores)
- [ ] Atalhos de teclado globais
- [ ] Responsividade mobile completa
- [ ] Modo escuro/claro

**Entregável:** Produto polido, pronto para usuários reais.

---

### Sprint 8 — Infraestrutura de Produção (Semanas 15-16)

**Objetivo:** Produção robusta

- [ ] Rate limiting (upstash/ratelimit)
- [ ] Error boundaries + Sentry
- [ ] Logs estruturados
- [ ] Testes E2E críticos (Playwright): login, adicionar transação, chat com Zara
- [ ] CI/CD (GitHub Actions → Vercel)
- [ ] Análise de bundle + otimizações
- [ ] LGPD: exportar dados + excluir conta
- [ ] Documentação interna de APIs

**Entregável:** App em produção, estável e monitorado.

---

### Backlog Futuro (Pós-MVP)

- [ ] Open Finance / Open Banking (Pluggy ou Belvo para conexão bancária real)
- [ ] Multi-moeda com taxas de câmbio em tempo real
- [ ] Módulo de investimentos (integração com corretoras)
- [ ] Análise de imposto de renda (IRPF)
- [ ] App mobile (React Native ou PWA)
- [ ] Compartilhamento familiar (contas multi-usuário)
- [ ] Modo offline (Service Worker + IndexedDB)
- [ ] Zara com function calling (criar transação direto pela IA)
- [ ] Análise preditiva com ML (detectar padrões de gastos anômalos)
- [ ] Integração com NFS-e (nota fiscal para freelancers)

---

## Apêndice: Atalhos de Teclado Globais

| Atalho | Ação |
|--------|------|
| `T` | Nova transação |
| `B` | Novo orçamento |
| `G` | Nova meta |
| `V` | Ativar voz (Zara) |
| `Cmd/Ctrl + K` | Command palette (busca global) |
| `Cmd/Ctrl + /` | Abrir/fechar Zara |
| `Escape` | Fechar modal/dock |
| `?` | Mostrar atalhos |

---

## Apêndice: Paleta de Categorias (CSS)

```css
.category-food        { --cat-color: #22c55e; }
.category-housing     { --cat-color: #3b82f6; }
.category-transport   { --cat-color: #f59e0b; }
.category-health      { --cat-color: #ef4444; }
.category-education   { --cat-color: #8b5cf6; }
.category-leisure     { --cat-color: #ec4899; }
.category-clothing    { --cat-color: #f97316; }
.category-beauty      { --cat-color: #db2777; }
.category-pet         { --cat-color: #84cc16; }
.category-tech        { --cat-color: #06b6d4; }
.category-income      { --cat-color: #10b981; }
.category-financial   { --cat-color: #6366f1; }
.category-gift        { --cat-color: #a855f7; }
.category-other       { --cat-color: #94a3b8; }
```

---

*Documento gerado em agosto de 2025. Versão 1.0. Atualizar conforme decisões de produto evoluírem.*
