export const currency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)

export const currencyDetailed = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)

export const totalBalance = 48250.75
export const monthlyIncome = 12400
export const monthlyExpenses = 7820
export const savingsRate = 0.37

export type CashflowPoint = {
  month: string
  entradas: number
  saidas: number
}

export const cashflow: CashflowPoint[] = [
  { month: "Jan", entradas: 11200, saidas: 8100 },
  { month: "Fev", entradas: 11800, saidas: 7600 },
  { month: "Mar", entradas: 10900, saidas: 8900 },
  { month: "Abr", entradas: 12100, saidas: 7200 },
  { month: "Mai", entradas: 12000, saidas: 8300 },
  { month: "Jun", entradas: 12400, saidas: 6900 },
  { month: "Jul", entradas: 12400, saidas: 7820 },
]

export type Category = {
  name: string
  value: number
  color: string
}

export const categories: Category[] = [
  { name: "Moradia", value: 2800, color: "var(--color-chart-1)" },
  { name: "Alimentação", value: 1850, color: "var(--color-chart-2)" },
  { name: "Transporte", value: 1120, color: "var(--color-chart-4)" },
  { name: "Lazer", value: 980, color: "var(--color-chart-3)" },
  { name: "Outros", value: 1070, color: "var(--color-chart-5)" },
]

export type Budget = {
  name: string
  spent: number
  limit: number
}

export const budgets: Budget[] = [
  { name: "Alimentação", spent: 1850, limit: 2000 },
  { name: "Lazer", spent: 980, limit: 900 },
  { name: "Transporte", spent: 1120, limit: 1500 },
  { name: "Compras", spent: 640, limit: 1200 },
]

export type Transaction = {
  id: string
  name: string
  category: string
  date: string
  amount: number
}

export const transactions: Transaction[] = [
  { id: "1", name: "Supermercado Pão de Açúcar", category: "Alimentação", date: "14 Jul", amount: -348.9 },
  { id: "2", name: "Salário — Acme Ltda", category: "Receita", date: "12 Jul", amount: 12400 },
  { id: "3", name: "Uber", category: "Transporte", date: "12 Jul", amount: -32.5 },
  { id: "4", name: "Netflix", category: "Lazer", date: "10 Jul", amount: -55.9 },
  { id: "5", name: "Aluguel", category: "Moradia", date: "5 Jul", amount: -2800 },
  { id: "6", name: "Freelance — Design", category: "Receita", date: "3 Jul", amount: 1600 },
  { id: "7", name: "Farmácia Drogasil", category: "Saúde", date: "2 Jul", amount: -89.7 },
]
