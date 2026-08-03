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

    // Lista de modelos suportados para fallback em caso de erro 404
    const candidateModels = [
      "nvidia/nemotron-3-super-120b-a12b",
      "nvidia/llama-3.1-nemotron-70b-instruct",
      "meta/llama-3.1-70b-instruct",
    ]

    let response: Response | null = null
    let selectedModelUsed = ""
    let lastErrorDetails = ""

    for (const modelName of candidateModels) {
      console.log(`Tentando requisição para o modelo NVIDIA: ${modelName}`)
      
      const payload: Record<string, any> = {
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 1,
        top_p: 0.95,
        max_tokens: 4096,
      }

      // Parâmetros especiais para o nemotron-3-super-120b-a12b
      if (modelName === "nvidia/nemotron-3-super-120b-a12b") {
        payload.chat_template_kwargs = { enable_thinking: true }
        payload.reasoning_budget = 4096
      }

      try {
        const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        })

        if (res.ok) {
          response = res
          selectedModelUsed = modelName
          break
        } else {
          lastErrorDetails = `[${res.status}] ${await res.text()}`
          console.warn(`Modelo ${modelName} falhou: ${lastErrorDetails}`)
        }
      } catch (err: any) {
        console.error(`Erro ao chamar ${modelName}:`, err)
      }
    }

    if (!response || !response.ok) {
      return NextResponse.json(
        { error: `Erro na API NVIDIA. Detalhes: ${lastErrorDetails}` },
        { status: 500 }
      )
    }

    const data = await response.json()
    const choice = data.choices?.[0]?.message
    const content = choice?.content || ""
    const reasoning = choice?.reasoning_content || ""

    const reply = content || reasoning || "Não foi possível obter resposta do modelo."

    return NextResponse.json({ reply, model: selectedModelUsed })
  } catch (err: any) {
    console.error("Chat API route exception:", err)
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
  }
}
