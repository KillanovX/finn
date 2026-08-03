import { NextResponse } from "next/server"
import {
  budgets,
  monthlyExpenses,
  monthlyIncome,
  savingsRate,
  totalBalance,
  transactions,
} from "@/lib/finance-data"

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensagem inválida" }, { status: 400 })
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
- Use os dados financeiros reais acima para responder dúvidas sobre saldo, gastos, orçamentos e dicas de economia.`

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "nvidia/llama-3.1-nemotron-70b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.6,
        top_p: 0.95,
        max_tokens: 1024,
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
    const reply =
      data.choices?.[0]?.message?.content ||
      "Desculpe, não consegui obter a resposta do modelo."

    return NextResponse.json({ reply })
  } catch (err: any) {
    console.error("Chat API route exception:", err)
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
  }
}
