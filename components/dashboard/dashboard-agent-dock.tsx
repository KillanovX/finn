"use client"

import { useState } from "react"
import { AgentDock } from "@/components/ui/agent-dock"
import { Sparkles, X } from "lucide-react"

export function DashboardAgentDock() {
  const [response, setResponse] = useState<string | null>(null)
  const [lastMessage, setLastMessage] = useState<string | null>(null)

  const handleMessageSubmit = async (message: string) => {
    setLastMessage(message)
    setResponse(null)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })

      const data = await res.json()
      if (data.reply) {
        setResponse(data.reply)
      } else if (data.error) {
        setResponse(`Ops! ${data.error}`)
      }
    } catch (err) {
      setResponse("Erro de conexão ao comunicar com a IA.")
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 w-full max-w-[calc(100vw-3rem)] sm:max-w-md">
      {/* Response Card Popup */}
      {response && (
        <div className="relative w-full overflow-hidden rounded-2xl bg-neutral-950/95 border border-neutral-800 p-4 text-white shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
              <Sparkles className="size-3.5 text-amber-400" />
              <span>Zara · Assistente Financeira</span>
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
        idleStatus="Sua assistente financeira"
        workingStatus="Analisando suas finanças..."
        onMessageSubmit={handleMessageSubmit}
        className="w-full"
      />
    </div>
  )
}
