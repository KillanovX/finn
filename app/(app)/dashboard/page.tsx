"use client"

import { Budgets } from "@/components/dashboard/budgets"
import { CashflowChart } from "@/components/dashboard/cashflow-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { Transactions } from "@/components/dashboard/transactions"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <SummaryCards />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CashflowChart />
        </div>
        <CategoryChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Transactions />
        </div>
        <Budgets />
      </div>
    </div>
  )
}
