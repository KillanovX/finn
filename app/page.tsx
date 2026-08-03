import { AgentDock } from "@/components/ui/agent-dock"
import { Budgets } from "@/components/dashboard/budgets"
import { CashflowChart } from "@/components/dashboard/cashflow-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { Transactions } from "@/components/dashboard/transactions"

const avatarSrc =
  "https://api.dicebear.com/10.x/initial-face/svg?seed=Zaraaaa&size=80"

export default function Page() {
  return (
    <main className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10 min-h-screen">
      <DashboardHeader />

      <div className="mt-8 space-y-4">
        <SummaryCards />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CashflowChart />
          </div>
          <CategoryChart />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Transactions />
          </div>
          <Budgets />
        </div>
      </div>

      {/* Floating Agent Dock at bottom right corner */}
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
    </main>
  )
}
