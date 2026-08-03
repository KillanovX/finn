"use client"

import React, { useState } from "react"
import { Plus, CalendarDays, Clock, CheckCircle, Pause } from "lucide-react"
import { useFinanceStore } from "@/store/useFinanceStore"
import { useBalance } from "@/lib/balance-context"
import { AnimatedAmount } from "@/components/ui/animated-amount"

export default function RecurrencesPage() {
  const { recurrences, accounts, addRecurrence, toggleRecurrence } = useFinanceStore()
  const { formatCurrency, isBalanceVisible } = useBalance()

  const [showModal, setShowModal] = useState(false)
  const [desc, setDesc] = useState("")
  const [amountStr, setAmountStr] = useState("")
  const [category, setCategory] = useState("Moradia")
  const [selectedAccId, setSelectedAccId] = useState(accounts[0]?.id || "acc-1")

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(amountStr)
    if (!desc || isNaN(val) || val <= 0) return

    addRecurrence({
      description: desc,
      amount: val,
      type: "EXPENSE",
      category,
      accountId: selectedAccId,
      frequency: "MONTHLY",
      nextDueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
      isActive: true,
    })

    setDesc("")
    setAmountStr("")
    setShowModal(false)
  }

  const totalMonthlyRecurring = recurrences
    .filter((r) => r.isActive)
    .reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recorrências & Assinaturas</h2>
          <p className="text-sm text-muted-foreground">Acompanhe suas contas fixas e assinaturas recorrentes automáticas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Nova Recorrência</span>
        </button>
      </div>

      {/* Monthly Recurring Summary */}
      <div className="rounded-3xl bg-card border border-border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total de Recorrências Ativas/Mês</span>
          <div className="mt-1 h-[32px] flex items-center text-3xl font-bold text-foreground">
            <AnimatedAmount value={formatCurrency(totalMonthlyRecurring)} isVisible={isBalanceVisible} />
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5 text-xs text-muted-foreground">
          <Clock className="size-4 text-primary" />
          <span>{recurrences.filter((r) => r.isActive).length} serviços ativos</span>
        </div>
      </div>

      {/* Recurrences List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recurrences.map((r) => {
          const acc = accounts.find((a) => a.id === r.accountId)

          return (
            <div key={r.id} className="rounded-3xl bg-card border border-border p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CalendarDays className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base leading-tight">{r.description}</h3>
                    <p className="text-xs text-muted-foreground">{r.category} · {r.frequency}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleRecurrence(r.id)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    r.isActive ? "text-emerald-500 hover:bg-emerald-500/10" : "text-muted-foreground hover:bg-secondary"
                  }`}
                  title={r.isActive ? "Pausar recorrência" : "Ativar recorrência"}
                >
                  {r.isActive ? <CheckCircle className="size-5" /> : <Pause className="size-5" />}
                </button>
              </div>

              <div>
                <span className="text-xs text-muted-foreground font-medium">Valor Recorrente</span>
                <div className="h-[28px] flex items-center text-2xl font-bold text-foreground">
                  <AnimatedAmount value={formatCurrency(r.amount)} isVisible={isBalanceVisible} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Próximo vencimento: {r.nextDueDate} ({acc?.name})</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* New Recurrence Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground mb-4">Nova Recorrência</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Netflix, Aluguel, Academia..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Valor Mensal (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="50,00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Categoria</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Conta Bancária</label>
                <select
                  value={selectedAccId}
                  onChange={(e) => setSelectedAccId(e.target.value)}
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
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow transition-transform active:scale-95 cursor-pointer"
                >
                  Criar Recorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
