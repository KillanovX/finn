import { NextResponse } from "next/server"
import {
  budgets,
  monthlyExpenses,
  monthlyIncome,
  savingsRate,
  totalBalance,
  transactions,
} from "@/lib/finance-data"

function parseQuickTransaction(text: string, todayDate: string) {
  const cleanedText = text.trim()

  // Match numbers (e.g. 800, 800.50, 45,90)
  const amountMatch = cleanedText.match(/(?:r\$?\s*)?(\d+(?:[.,]\d{1,2})?)/i)
  if (!amountMatch) return null

  const amount = parseFloat(amountMatch[1].replace(",", "."))
  if (isNaN(amount) || amount <= 0) return null

  // Check if string looks like a launch command or quick expense
  const launchKeywords = /mercado|almoço|jantar|uber|lançar|despesa|receita|gastei|paguei|comida|farmacia|farmácia|gasolina|pix/i
  if (!launchKeywords.test(cleanedText) && cleanedText.split(" ").length > 8) {
    return null
  }

  let remaining = cleanedText
    .replace(amountMatch[0], "")
    .replace(/\b(lançar|despesa|receita|gastei|paguei|com|na|no|em|r\$)\b/gi, "")
    .trim()

  // Date detection: YYYY-MM-DD or DD/MM/YYYY
  let date = todayDate
  const dateMatch = remaining.match(/(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/)
  if (dateMatch) {
    if (dateMatch[1]) {
      date = dateMatch[1]
    } else if (dateMatch[2]) {
      const parts = dateMatch[2].split("/")
      const d = parts[0].padStart(2, "0")
      const m = parts[1].padStart(2, "0")
      const y = parts[2]
        ? parts[2].length === 2
          ? "20" + parts[2]
          : parts[2]
        : new Date().getFullYear().toString()
      date = `${y}-${m}-${d}`
    }
    remaining = remaining.replace(dateMatch[0], "").trim()
  }

  // Type detection
  let type: "INCOME" | "EXPENSE" = "EXPENSE"
  if (/recebi|ganhei|salário|entrada|receita|pix recebido/i.test(cleanedText)) {
    type = "INCOME"
  }

  // Account detection (Nubank, Itaú, XP, Caixa, etc.)
  let accountSearch = ""
  const bankMatch = remaining.match(/\b(nubank|itaú|itau|caixa|xp|bradesco|inter|santander|pj)\b/i)
  if (bankMatch) {
    accountSearch = bankMatch[1]
    remaining = remaining.replace(bankMatch[0], "").trim()
  }

  // Category inference
  let category = "Outros"
  if (/mercado|pão|supermercado|almoço|jantar|comida|restaurante|ifood|lanche|padaria/i.test(cleanedText)) {
    category = "Alimentação"
  } else if (/uber|99|combustível|gasolina|estacionamento|ônibus|táxi|passagem/i.test(cleanedText)) {
    category = "Transporte"
  } else if (/aluguel|condomínio|luz|água|internet|iptu/i.test(cleanedText)) {
    category = "Moradia"
  } else if (/cinema|netflix|spotify|jogo|lazer|show|festa|bar/i.test(cleanedText)) {
    category = "Lazer"
  } else if (/remédio|farmácia|médico|consulta|drogasil|exame|saúde/i.test(cleanedText)) {
    category = "Saúde"
  } else if (/salário|freela|freelance|venda|pro-labore|pix/i.test(cleanedText)) {
    category = "Receita"
  } else if (/roupa|compra|shopping|eletrônico/i.test(cleanedText)) {
    category = "Compras"
  }

  const description = remaining
    ? remaining.charAt(0).toUpperCase() + remaining.slice(1).trim()
    : type === "INCOME"
    ? "Receita"
    : "Despesa"

  return {
    description,
    amount,
    type,
    category,
    date,
    accountSearch,
  }
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensagem inválida" }, { status: 400 })
    }

    const todayDate = new Date().toISOString().split("T")[0]

    // Fast local transaction parser check
    const quickTx = parseQuickTransaction(message, todayDate)
    if (quickTx) {
      const typeStr = quickTx.type === "INCOME" ? "receita" : "despesa"
      const dateFormatted = quickTx.date.split("-").reverse().join("/")
      const reply = `Lançamento efetuado! Registrei sua ${typeStr} de R$ ${quickTx.amount.toFixed(2).replace(".", ",")} (${quickTx.description}) na categoria ${quickTx.category} (Data: ${dateFormatted}).`

      return NextResponse.json({
        reply,
        action: {
          type: "ADD_TRANSACTION",
          transaction: quickTx,
        },
      })
    }

    const apiKey = process.env.NVIDIA_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "NVIDIA_API_KEY não configurada no ambiente" },
        { status: 500 }
      )
    }

    const systemPrompt = `Você é a Zara, a assistente de inteligência financeira pessoal do aplicativo Cofre.
Você é extremamente prestativa, simpática, direta e especializada em finanças pessoais, economia e gestão orçamentária.

Contexto financeiro atual do usuário (Marina):
- Data de hoje: ${todayDate}
- Saldo Total: R$ ${totalBalance.toLocaleString("pt-BR")}
- Receitas do Mês: R$ ${monthlyIncome.toLocaleString("pt-BR")}
- Despesas do Mês: R$ ${monthlyExpenses.toLocaleString("pt-BR")}
- Taxa de Poupança: ${Math.round(savingsRate * 100)}% (Meta: 40%)
- Transações Recentes: ${transactions
      .map((t) => `${t.name} (${t.category}): R$ ${t.amount}`)
      .join("; ")}
- Orçamentos: ${budgets
      .map((b) => `${b.name}: R$ ${b.spent} de R$ ${b.limit}`)
      .join("; ")}

Instruções:
- Responda sempre em português do Brasil.
- Seja clara, amigável e concisa (máximo 2 a 3 parágrafos curtos).
- Se o usuário pedir para lançar/cadastrar uma despesa ou receita, confirme o lançamento de forma entusiasmada.`

    const modelName = "nvidia/nemotron-3-super-120b-a12b"

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 4096,
        chat_template_kwargs: { enable_thinking: true },
        reasoning_budget: 4096,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("NVIDIA API error:", response.status, errText)
      return NextResponse.json(
        { error: `Erro na API NVIDIA (${response.status})` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const choice = data.choices?.[0]?.message
    const content = choice?.content || ""
    const reasoning = choice?.reasoning_content || ""

    const reply = content || reasoning || "Não foi possível obter resposta do modelo."

    return NextResponse.json({ reply, model: modelName })
  } catch (err: any) {
    console.error("Chat API route exception:", err)
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
  }
}
