"use client"

import React, { useState } from "react"
import { Plus, Wallet, Building2, CreditCard, TrendingUp, PiggyBank } from "lucide-react"
import { useFinanceStore, AccountType } from "@/store/useFinanceStore"
import { useBalance } from "@/lib/balance-context"
import { AnimatedAmount } from "@/components/ui/animated-amount"

export default function AccountsPage() {
  const { accounts, addAccount } = useFinanceStore()
  const { formatCurrency, isBalanceVisible } = useBalance()

  const [showModal, setShowModal] = useState(false)
  const [accName, setAccName] = useState("")
  const [accType, setAccType] = useState<AccountType>("CHECKING")
  const [balanceStr, setBalanceStr] = useState("")

  const totalNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(balanceStr)
    if (!accName || isNaN(val)) return

    addAccount({
      name: accName,
      type: accType,
      balance: val,
      color: "#8b5cf6",
    })

    setAccName("")
    setBalanceStr("")
    setShowModal(false)
  }

  const getTypeIcon = (type: AccountType) => {
    switch (type) {
      case "CHECKING": return Building2
      case "SAVINGS": return PiggyBank
      case "INVESTMENT": return TrendingUp
      case "CREDIT": return CreditCard
      default: return Wallet
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Contas & Carteiras</h2>
          <p className="text-sm text-muted-foreground">Gerencie seus bancos, cartões de crédito e investimentos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Nova Conta</span>
        </button>
      </div>

      {/* Net Worth Summary Card */}
      <div className="rounded-3xl bg-primary p-6 text-primary-foreground">
        <span className="text-xs text-primary-foreground/70 uppercase tracking-wider font-semibold">Patrimônio Líquido Total</span>
        <div className="mt-2 h-[36px] flex items-center text-3xl font-bold tracking-tight">
          <AnimatedAmount value={formatCurrency(totalNetWorth)} isVisible={isBalanceVisible} />
        </div>
        <p className="mt-2 text-xs text-primary-foreground/70">Soma consolidada de todas as contas e dívidas de cartão</p>
      </div>

      {/* Accounts Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((acc) => {
          const Icon = getTypeIcon(acc.type)
          const isNegative = acc.balance < 0

          return (
            <div key={acc.id} className="rounded-3xl bg-card border border-border p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-10 items-center justify-center rounded-xl text-white font-bold"
                    style={{ backgroundColor: acc.color }}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base leading-tight">{acc.name}</h3>
                    <p className="text-xs text-muted-foreground">{acc.type}</p>
                  </div>
                </div>
                {acc.isDefault && (
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    Padrão
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs text-muted-foreground font-medium">Saldo Atual</span>
                <div className={`h-[28px] flex items-center text-2xl font-bold ${isNegative ? "text-destructive" : "text-foreground"}`}>
                  <AnimatedAmount value={formatCurrency(acc.balance)} isVisible={isBalanceVisible} />
                </div>
              </div>

              {acc.type === "CREDIT" && acc.creditLimit && (
                <div className="pt-2 border-t border-border text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Limite Total:</span>
                    <span className="font-semibold text-foreground">{formatCurrency(acc.creditLimit)}</span>
                  </div>
                  {acc.closingDay && acc.dueDay && (
                    <p className="text-[11px]">Fecha dia {acc.closingDay} · Vence dia {acc.dueDay}</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* New Account Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground mb-4">Nova Conta Bancária</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Nome da Conta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Nubank, Itaú, XP..."
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Tipo de Conta</label>
                <select
                  value={accType}
                  onChange={(e) => setAccType(e.target.value as AccountType)}
                  className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none cursor-pointer"
                >
                  <option value="CHECKING">Conta Corrente</option>
                  <option value="SAVINGS">Poupança</option>
                  <option value="INVESTMENT">Investimento</option>
                  <option value="CREDIT">Cartão de Crédito</option>
                  <option value="WALLET">Carteira (Dinheiro)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Saldo Inicial (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={balanceStr}
                  onChange={(e) => setBalanceStr(e.target.value)}
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
                  Criar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
