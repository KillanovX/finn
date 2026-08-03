import { ArrowDownRight, ArrowUpRight, Eye, TrendingUp, Wallet } from "lucide-react"
import { currency, monthlyExpenses, monthlyIncome, savingsRate, totalBalance } from "@/lib/finance-data"

export function SummaryCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Saldo total — card destaque escuro */}
      <div className="relative overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-foreground/70">Saldo total</span>
          <Eye className="size-4 text-primary-foreground/70" aria-hidden="true" />
        </div>
        <p className="mt-4 text-3xl font-semibold tracking-tight">{currency(totalBalance)}</p>
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
        <p className="mt-4 text-3xl font-semibold tracking-tight">{currency(monthlyIncome)}</p>
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
        <p className="mt-4 text-3xl font-semibold tracking-tight">{currency(monthlyExpenses)}</p>
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
        <p className="mt-4 text-3xl font-semibold tracking-tight">
          {Math.round(savingsRate * 100)}%
        </p>
        <p className="mt-3 text-xs text-muted-foreground">Meta: 40%</p>
      </div>
    </div>
  )
}
