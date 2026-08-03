"use client"

import React, { useState } from "react"
import { Plus, PiggyBank, AlertTriangle, CheckCircle2 } from "lucide-react"
import { useFinanceStore } from "@/store/useFinanceStore"
import { useBalance } from "@/lib/balance-context"
import { AnimatedAmount } from "@/components/ui/animated-amount"

export default function BudgetsPage() {
  const { budgets, addBudget } = useFinanceStore()
  const { formatCurrency, isBalanceVisible } = useBalance()

  const [showModal, setShowModal] = useState(false)
  const [category, setCategory] = useState("Educação")
  const [limitStr, setLimitStr] = useState("")

  const totalLimit = budgets.reduce((sum, b) => sum + b.limitAmount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const limitVal = parseFloat(limitStr)
    if (!category || isNaN(limitVal) || limitVal <= 0) return

    addBudget({
      category,
      limitAmount: limitVal,
      color: "#8b5cf6",
      alertAtPercent: 80,
    })

    setLimitStr("")
    setShowModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orçamentos Mensais</h2>
          <p className="text-sm text-muted-foreground">Monitore e controle seus limites de gastos por categoria</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Novo Orçamento</span>
        </button>
      </div>

      {/* KPI Overview Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl bg-card border border-border p-5">
          <span className="text-xs text-muted-foreground">Total Orçado</span>
          <div className="mt-2 h-[28px] flex items-center text-2xl font-bold">
            <AnimatedAmount value={formatCurrency(totalLimit)} isVisible={isBalanceVisible} />
          </div>
        </div>
        <div className="rounded-3xl bg-card border border-border p-5">
          <span className="text-xs text-muted-foreground">Total Gasto</span>
          <div className="mt-2 h-[28px] flex items-center text-2xl font-bold text-foreground">
            <AnimatedAmount value={formatCurrency(totalSpent)} isVisible={isBalanceVisible} />
          </div>
        </div>
        <div className="rounded-3xl bg-card border border-border p-5 sm:col-span-2 lg:col-span-1">
          <span className="text-xs text-muted-foreground">Saldo Restante do Orçamento</span>
          <div className="mt-2 h-[28px] flex items-center text-2xl font-bold text-emerald-500">
            <AnimatedAmount value={formatCurrency(Math.max(0, totalLimit - totalSpent))} isVisible={isBalanceVisible} />
          </div>
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {budgets.map((b) => {
          const pct = Math.min((b.spentAmount / b.limitAmount) * 100, 100)
          const isOver = b.spentAmount > b.limitAmount
          const isWarning = pct >= b.alertAtPercent && !isOver

          return (
            <div key={b.id} className="rounded-3xl bg-card border border-border p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <PiggyBank className="size-5" />
                  </div>
                  <span className="font-semibold text-foreground text-base">{b.category}</span>
                </div>
                {isOver ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                    <AlertTriangle className="size-3.5" /> Estourado
                  </span>
                ) : isWarning ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-500">
                    <AlertTriangle className="size-3.5" /> {Math.round(pct)}% usado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500">
                    <CheckCircle2 className="size-3.5" /> Normal
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5 font-medium">
                  <span className="h-[18px] flex items-center">
                    Gasto:&nbsp;
                    <AnimatedAmount value={formatCurrency(b.spentAmount)} isVisible={isBalanceVisible} />
                  </span>
                  <span className="h-[18px] flex items-center">
                    Limite:&nbsp;
                    <AnimatedAmount value={formatCurrency(b.limitAmount)} isVisible={isBalanceVisible} />
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver ? "bg-destructive" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* New Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground mb-4">Novo Orçamento</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Categoria</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Educação, Lazer..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Limite Mensal (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="1000,00"
                  value={limitStr}
                  onChange={(e) => setLimitStr(e.target.value)}
                  className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow transition-transform active:scale-95 cursor-pointer"
                >
                  Criar Orçamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
