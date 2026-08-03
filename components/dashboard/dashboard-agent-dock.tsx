"use client"

import { useState } from "react"
import { AgentDock } from "@/components/ui/agent-dock"
import { Cpu, Sparkles, X } from "lucide-react"

const MODELS = [
  { id: "nvidia/llama-3.1-nemotron-nano-vl-8b-v1", name: "Nemotron Nano VL 8B", badge: "Nano 8B" },
  { id: "nvidia/nemotron-3-super-120b-a12b", name: "Nemotron 3 Super 120B", badge: "Super 120B" },
  { id: "nvidia/llama-3.1-nemotron-70b-instruct", name: "Nemotron 70B Instruct", badge: "70B Instruct" },
  { id: "meta/llama-3.1-70b-instruct", name: "Llama 3.1 70B", badge: "Llama 70B" },
]

export function DashboardAgentDock() {
  const [selectedModel, setSelectedModel] = useState<string>("nvidia/llama-3.1-nemotron-nano-vl-8b-v1")
  const [response, setResponse] = useState<string | null>(null)
  const [usedModel, setUsedModel] = useState<string | null>(null)
  const [lastMessage, setLastMessage] = useState<string | null>(null)

  const activeModelObj = MODELS.find((m) => m.id === selectedModel) ?? MODELS[0]

  const handleMessageSubmit = async (message: string) => {
    setLastMessage(message)
    setResponse(null)
    setUsedModel(null)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, model: selectedModel }),
      })

      const data = await res.json()
      if (data.reply) {
        setResponse(data.reply)
        setUsedModel(data.model || selectedModel)
      } else if (data.error) {
        setResponse(`Ops! ${data.error}`)
      }
    } catch (err) {
      setResponse("Erro de conexão ao comunicar com a IA.")
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 w-full max-w-[calc(100vw-3rem)] sm:max-w-md">
      {/* Model Selector Pill Header */}
      <div className="flex items-center gap-1.5 rounded-full bg-neutral-950/90 border border-neutral-800 p-1 px-3 text-xs text-neutral-300 shadow-lg backdrop-blur-md">
        <Cpu className="size-3.5 text-emerald-400 shrink-0" />
        <span className="font-medium text-neutral-400">Modelo:</span>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="bg-transparent text-white font-semibold outline-none cursor-pointer pr-1"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id} className="bg-neutral-900 text-white">
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Response Card Popup */}
      {response && (
        <div className="relative w-full overflow-hidden rounded-2xl bg-neutral-950/95 border border-neutral-800 p-4 text-white shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
              <Sparkles className="size-3.5 text-amber-400" />
              <span>
                Zara · {MODELS.find((m) => m.id === usedModel)?.badge || usedModel || activeModelObj.badge}
              </span>
            </div>
            <button
              onClick={() => setResponse(null)}
              className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
              aria-label="Fechar resposta"
            >
              <X className="size-4" />
            </button>
          </div>
          {lastMessage && (
            <p className="text-xs text-neutral-400 mb-2 italic">"{lastMessage}"</p>
          )}
          <div className="text-sm text-neutral-200 leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto pr-1">
            {response}
          </div>
        </div>
      )}

      {/* Dock */}
      <AgentDock
        agentName="Zara"
        avatarSrc="https://api.dicebear.com/10.x/initial-face/svg?seed=Zaraaaa&size=80"
        idleStatus={`Sua assistente (${activeModelObj.badge})`}
        workingStatus={`Consultando ${activeModelObj.badge}...`}
        onMessageSubmit={handleMessageSubmit}
        className="w-full"
      />
    </div>
  )
}
