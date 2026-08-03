"use client"

import {
  Car,
  Film,
  Home,
  HeartPulse,
  ShoppingCart,
  TrendingUp,
  Utensils,
  type LucideIcon,
} from "lucide-react"
import { useBalance } from "@/lib/balance-context"
import { transactions } from "@/lib/finance-data"

const iconByCategory: Record<string, LucideIcon> = {
  Alimentação: Utensils,
  Receita: TrendingUp,
  Transporte: Car,
  Lazer: Film,
  Moradia: Home,
  Saúde: HeartPulse,
  Compras: ShoppingCart,
}

export function Transactions() {
  const { formatCurrency, isBalanceVisible } = useBalance()

  return (
    <div className="rounded-3xl bg-card p-5 text-card-foreground">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Transações recentes</h2>
          <p className="text-sm text-muted-foreground">Suas últimas movimentações</p>
        </div>
        <button className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          Ver tudo
        </button>
      </div>

      <ul className="divide-y divide-border">
        {transactions.map((t) => {
          const Icon = iconByCategory[t.category] ?? ShoppingCart
          const income = t.amount > 0
          return (
            <li key={t.id} className="flex items-center gap-3 py-3">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                  income ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.category} · {t.date}
                </p>
              </div>
              <span className={`text-sm font-semibold ${income ? "text-foreground" : "text-muted-foreground"}`}>
                {isBalanceVisible ? (income ? "+" : "") : ""}
                {formatCurrency(t.amount, true)}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
