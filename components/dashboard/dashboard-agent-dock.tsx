"use client"

import { AgentDock } from "@/components/ui/agent-dock"

const avatarSrc =
  "https://api.dicebear.com/10.x/initial-face/svg?seed=Zaraaaa&size=80"

export function DashboardAgentDock() {
  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-[calc(100vw-3rem)] sm:max-w-md">
      <AgentDock
        agentName="Zara"
        avatarSrc={avatarSrc}
        idleStatus="Sua assistente financeira"
        workingStatus="Analisando finanças..."
        onMessageSubmit={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1200))
        }}
      />
    </div>
  )
}
