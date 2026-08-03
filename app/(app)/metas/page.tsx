"use client"

import React, { useState } from "react"
import { Plus, Target, Trophy, ShieldAlert, DollarSign } from "lucide-react"
import { useFinanceStore } from "@/store/useFinanceStore"
import { useBalance } from "@/lib/balance-context"
import { AnimatedAmount } from "@/components/ui/animated-amount"

export default function GoalsPage() {
  const { goals, accounts, addGoal, depositToGoal } = useFinanceStore()
  const { formatCurrency, isBalanceVisible } = useBalance()

  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState<string | null>(null)

  // New Goal Form
  const [goalName, setGoalName] = useState("")
  const [targetStr, setTargetStr] = useState("")

  // Deposit Form
  const [depositStr, setDepositStr] = useState("")
  const [depositAccId, setDepositAccId] = useState(accounts[0]?.id || "acc-1")

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault()
    const targetVal = parseFloat(targetStr)
    if (!goalName || isNaN(targetVal) || targetVal <= 0) return

    addGoal({
      name: goalName,
      targetAmount: targetVal,
      category: "OTHER",
      color: "#8b5cf6",
      icon: "🎯",
    })

    setGoalName("")
    setTargetStr("")
    setShowGoalModal(false)
  }

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!showDepositModal) return
    const depVal = parseFloat(depositStr)
    if (isNaN(depVal) || depVal <= 0) return

    depositToGoal(showDepositModal, depVal, depositAccId)
    setDepositStr("")
    setShowDepositModal(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Metas Financeiras</h2>
          <p className="text-sm text-muted-foreground">Planeje e acompanhe suas conquistas de curto, médio e longo prazo</p>
        </div>
        <button
          onClick={() => setShowGoalModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Nova Meta</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((g) => {
          const pct = Math.min((g.savedAmount / g.targetAmount) * 100, 100)
          const isDone = g.savedAmount >= g.targetAmount

          return (
            <div key={g.id} className="rounded-3xl bg-card border border-border p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{g.icon || "🎯"}</span>
                  <div>
                    <h3 className="font-bold text-foreground text-base leading-tight">{g.name}</h3>
                    {g.deadline && <p className="text-xs text-muted-foreground">Prazo: {g.deadline}</p>}
                  </div>
                </div>
                {isDone && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500">
                    <Trophy className="size-3.5" /> Concluída
                  </span>
                )}
              </div>

              {/* Progress SVG Ring / Bar */}
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5 font-medium">
                  <span className="h-[18px] flex items-center">
                    Guardado:&nbsp;
                    <AnimatedAmount value={formatCurrency(g.savedAmount)} isVisible={isBalanceVisible} />
                  </span>
                  <span className="h-[18px] flex items-center">
                    Meta:&nbsp;
                    <AnimatedAmount value={formatCurrency(g.targetAmount)} isVisible={isBalanceVisible} />
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between items-center text-xs font-semibold text-muted-foreground">
                  <span>{Math.round(pct)}% concluído</span>
                  <span className="h-[18px] flex items-center">
                    Faltam:&nbsp;
                    <AnimatedAmount value={formatCurrency(Math.max(0, g.targetAmount - g.savedAmount))} isVisible={isBalanceVisible} />
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowDepositModal(g.id)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-secondary py-2 text-xs font-semibold text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                <DollarSign className="size-3.5" />
                <span>Depositar na Meta</span>
              </button>
            </div>
          )
        })}
      </div>

      {/* New Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground mb-4">Nova Meta</h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Nome da Meta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Viagem, Carro Novo..."
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Valor Alvo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="10000,00"
                  value={targetStr}
                  onChange={(e) => setTargetStr(e.target.value)}
                  className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow transition-transform active:scale-95 cursor-pointer"
                >
                  Criar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground mb-4">Depositar na Meta</h3>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Valor a Depositar (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="500,00"
                  value={depositStr}
                  onChange={(e) => setDepositStr(e.target.value)}
                  className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Conta de Origem</label>
                <select
                  value={depositAccId}
                  onChange={(e) => setDepositAccId(e.target.value)}
                  className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none cursor-pointer"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow transition-transform active:scale-95 cursor-pointer"
                >
                  Confirmar Depósito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
