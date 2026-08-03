"use client";

import { AgentDock } from "@/components/ui/agent-dock";

const avatarSrc =
  "https://api.dicebear.com/10.x/initial-face/svg?seed=Zaraaaa&size=80";

export default function AgentDockDemo() {
  return (
    <div className="relative min-h-screen w-full bg-neutral-900 p-8">
      <div className="fixed bottom-6 right-6 z-50 w-full max-w-[calc(100vw-3rem)] sm:max-w-md">
        <AgentDock
          agentName="Zara"
          avatarSrc={avatarSrc}
          idleStatus="Your hyperaide"
          onMessageSubmit={async () => {
            await new Promise((resolve) => setTimeout(resolve, 1200));
          }}
          workingStatus="doing stuff..."
        />
      </div>
    </div>
  );
}
