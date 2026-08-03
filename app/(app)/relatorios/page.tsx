"use client"

import React from "react"
import { BarChart3, TrendingUp, Download, PieChart as PieIcon, Flame } from "lucide-react"
import { useFinanceStore } from "@/store/useFinanceStore"
import { useBalance } from "@/lib/balance-context"
import { AnimatedAmount } from "@/components/ui/animated-amount"
import { CashflowChart } from "@/components/dashboard/cashflow-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"

export default function ReportsPage() {
  const { getMonthlyIncome, getMonthlyExpenses, getSavingsRate } = useFinanceStore()
  const { formatCurrency, isBalanceVisible } = useBalance()

  const income = getMonthlyIncome()
  const expenses = getMonthlyExpenses()
  const savings = getSavingsRate()
  const balance = income - expenses

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatórios & Analytics</h2>
          <p className="text-sm text-muted-foreground">Análise profunda da evolução das suas finanças</p>
        </div>
        <button
          onClick={() => alert("Gerando relatório PDF completo...")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-transform active:scale-95 cursor-pointer"
        >
          <Download className="size-4" />
          <span>Exportar Relatório PDF</span>
        </button>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl bg-card border border-border p-5">
          <span className="text-xs text-muted-foreground font-medium">Entradas do Mês</span>
          <div className="mt-2 h-[28px] flex items-center text-2xl font-bold text-emerald-500">
            <AnimatedAmount value={formatCurrency(income)} isVisible={isBalanceVisible} />
          </div>
        </div>

        <div className="rounded-3xl bg-card border border-border p-5">
          <span className="text-xs text-muted-foreground font-medium">Saídas do Mês</span>
          <div className="mt-2 h-[28px] flex items-center text-2xl font-bold text-foreground">
            <AnimatedAmount value={formatCurrency(expenses)} isVisible={isBalanceVisible} />
          </div>
        </div>

        <div className="rounded-3xl bg-card border border-border p-5">
          <span className="text-xs text-muted-foreground font-medium">Resultado do Período</span>
          <div className="mt-2 h-[28px] flex items-center text-2xl font-bold text-primary">
            <AnimatedAmount value={formatCurrency(balance)} isVisible={isBalanceVisible} />
          </div>
        </div>

        <div className="rounded-3xl bg-card border border-border p-5">
          <span className="text-xs text-muted-foreground font-medium">Taxa de Poupança</span>
          <div className="mt-2 h-[28px] flex items-center text-2xl font-bold text-amber-500">
            {Math.round(savings * 100)}%
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CashflowChart />
        </div>
        <CategoryChart />
      </div>

      {/* Heatmap Section */}
      <div className="rounded-3xl bg-card border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="size-5 text-amber-500" />
          <h3 className="text-lg font-bold text-foreground">Heatmap de Gastos Diários</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Padrão visual de intensidade de saídas no mês atual</p>
        <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground font-medium">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day} className="py-1">{day}</div>
          ))}
          {Array.from({ length: 31 }).map((_, idx) => {
            const intensity = (idx * 17) % 100
            const bgClass =
              intensity > 70
                ? "bg-primary text-primary-foreground font-bold"
                : intensity > 40
                ? "bg-primary/40 text-foreground"
                : "bg-secondary text-muted-foreground"

            return (
              <div key={idx} className={`h-10 rounded-xl flex items-center justify-center ${bgClass}`}>
                {idx + 1}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
