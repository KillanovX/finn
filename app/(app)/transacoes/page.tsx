"use client"

import React, { useState } from "react"
import { Plus, Search, Filter, ArrowUpRight, ArrowDownRight, Tag } from "lucide-react"
import { useFinanceStore } from "@/store/useFinanceStore"
import { useBalance } from "@/lib/balance-context"
import { AnimatedAmount } from "@/components/ui/animated-amount"

export default function TransactionsPage() {
  const { transactions, accounts, addTransaction, deleteTransaction } = useFinanceStore()
  const { formatCurrency, isBalanceVisible } = useBalance()

  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL")
  const [showModal, setShowModal] = useState(false)

  // New Transaction Form State
  const [desc, setDesc] = useState("")
  const [amountStr, setAmountStr] = useState("")
  const [txType, setTxType] = useState<"INCOME" | "EXPENSE">("EXPENSE")
  const [category, setCategory] = useState("Alimentação")
  const [selectedAccId, setSelectedAccId] = useState(accounts[0]?.id || "acc-1")

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === "ALL" || t.type === filterType
    return matchesSearch && matchesType
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(amountStr)
    if (!desc || isNaN(val) || val <= 0) return

    addTransaction({
      description: desc,
      amount: val,
      type: txType,
      category: category,
      date: new Date().toISOString().split("T")[0],
      accountId: selectedAccId,
    })

    setDesc("")
    setAmountStr("")
    setShowModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transações</h2>
          <p className="text-sm text-muted-foreground">Gerencie todas as suas movimentações financeiras</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Nova Transação</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-card p-3 border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por descrição ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-secondary/60 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["ALL", "INCOME", "EXPENSE"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterType === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {type === "ALL" ? "Todas" : type === "INCOME" ? "Receitas" : "Despesas"}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List Table / Cards */}
      <div className="rounded-3xl bg-card border border-border p-5">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-sm">Nenhuma transação encontrada.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filteredTransactions.map((t) => {
              const isIncome = t.type === "INCOME"
              const acc = accounts.find((a) => a.id === t.accountId)
              const formattedVal = (isIncome ? "+" : "-") + formatCurrency(t.amount, true)

              return (
                <li key={t.id} className="flex items-center gap-4 py-3.5">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                      isIncome ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {isIncome ? <ArrowUpRight className="size-5" /> : <ArrowDownRight className="size-5" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm text-foreground">{t.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5">
                        <Tag className="size-3" />
                        {t.category}
                      </span>
                      <span>·</span>
                      <span>{acc?.name || "Conta"}</span>
                      <span>·</span>
                      <span>{t.date}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`h-[20px] flex items-center justify-end text-sm font-semibold ${isIncome ? "text-emerald-500" : "text-foreground"}`}>
                      <AnimatedAmount value={formattedVal} isVisible={isBalanceVisible} />
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* New Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground mb-4">Nova Transação</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-secondary">
                <button
                  type="button"
                  onClick={() => setTxType("EXPENSE")}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    txType === "EXPENSE" ? "bg-destructive text-destructive-foreground shadow" : "text-muted-foreground"
                  }`}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setTxType("INCOME")}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    txType === "INCOME" ? "bg-emerald-500 text-white shadow" : "text-muted-foreground"
                  }`}
                >
                  Receita
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Supermercado, Salário..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none cursor-pointer"
                >
                  <option value="Alimentação">Alimentação</option>
                  <option value="Moradia">Moradia</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Lazer">Lazer</option>
                  <option value="Saúde">Saúde</option>
                  <option value="Receita">Receita</option>
                  <option value="Outros">Outros</option>
                </select>
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
                  Salvar Transação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
