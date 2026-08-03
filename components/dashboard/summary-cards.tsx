"use client"

import { ArrowDownRight, ArrowUpRight, Eye, EyeOff, TrendingUp, Wallet } from "lucide-react"
import { useBalance } from "@/lib/balance-context"
import { monthlyExpenses, monthlyIncome, savingsRate, totalBalance } from "@/lib/finance-data"
import { AnimatedAmount } from "@/components/ui/animated-amount"

export function SummaryCards() {
  const { isBalanceVisible, toggleBalance, formatCurrency } = useBalance()

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Saldo total — card destaque escuro */}
      <div className="relative overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-foreground/70">Saldo total</span>
          <button
            type="button"
            onClick={toggleBalance}
            className="flex size-7 items-center justify-center rounded-full text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground cursor-pointer"
            aria-label={isBalanceVisible ? "Esconder saldo" : "Exibir saldo"}
            title={isBalanceVisible ? "Esconder saldo" : "Exibir saldo"}
          >
            {isBalanceVisible ? (
              <Eye className="size-4" aria-hidden="true" />
            ) : (
              <EyeOff className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
        <div className="mt-4 h-[36px] flex items-center text-3xl font-semibold tracking-tight">
          <AnimatedAmount value={formatCurrency(totalBalance)} isVisible={isBalanceVisible} />
        </div>
        <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary-foreground/10 px-2 py-1 text-xs">
          <TrendingUp className="size-3.5" aria-hidden="true" />
          +2,4% este mês
        </div>
      </div>

      {/* Receitas — card lima */}
      <div className="rounded-3xl bg-accent p-5 text-accent-foreground">
        <div className="flex items-center justify-between">
          <span className="text-sm text-accent-foreground/70">Receitas do mês</span>
          <div className="flex size-8 items-center justify-center rounded-full bg-accent-foreground/10">
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-4 h-[36px] flex items-center text-3xl font-semibold tracking-tight">
          <AnimatedAmount value={formatCurrency(monthlyIncome)} isVisible={isBalanceVisible} />
        </div>
        <p className="mt-3 text-xs text-accent-foreground/70">Entradas confirmadas</p>
      </div>

      {/* Despesas */}
      <div className="rounded-3xl bg-card p-5 text-card-foreground">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Despesas do mês</span>
          <div className="flex size-8 items-center justify-center rounded-full bg-secondary">
            <ArrowDownRight className="size-4" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-4 h-[36px] flex items-center text-3xl font-semibold tracking-tight">
          <AnimatedAmount value={formatCurrency(monthlyExpenses)} isVisible={isBalanceVisible} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">63% da sua renda</p>
      </div>

      {/* Taxa de poupança */}
      <div className="rounded-3xl bg-card p-5 text-card-foreground">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Taxa de poupança</span>
          <div className="flex size-8 items-center justify-center rounded-full bg-secondary">
            <Wallet className="size-4" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-4 h-[36px] flex items-center text-3xl font-semibold tracking-tight">
          {Math.round(savingsRate * 100)}%
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Meta: 40%</p>
      </div>
    </div>
  )
}
