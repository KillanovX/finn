import { Budgets } from "@/components/dashboard/budgets"
import { CashflowChart } from "@/components/dashboard/cashflow-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { Transactions } from "@/components/dashboard/transactions"

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
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
    </main>
  )
}
