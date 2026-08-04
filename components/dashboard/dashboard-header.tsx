"use client"

import { Bell, Eye, EyeOff, PiggyBank, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBalance } from "@/lib/balance-context"

export function DashboardHeader() {
  const { isBalanceVisible, toggleBalance } = useBalance()

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <PiggyBank className="size-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-semibold leading-tight tracking-tight">Cofre</h1>
          <p className="text-sm text-muted-foreground">Olá, Marina</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Buscar transações"
            aria-label="Buscar transações"
            className="h-10 w-56 rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="size-10 rounded-full border-border bg-card cursor-pointer"
          onClick={toggleBalance}
          aria-label={isBalanceVisible ? "Esconder saldos" : "Exibir saldos"}
          title={isBalanceVisible ? "Esconder saldos" : "Exibir saldos"}
        >
          {isBalanceVisible ? (
            <Eye className="size-4" />
          ) : (
            <EyeOff className="size-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-10 rounded-full border-border bg-card cursor-pointer"
          aria-label="Notificações"
        >
          <Bell className="size-4" />
        </Button>
        <Button className="h-10 rounded-full pl-3 pr-4 cursor-pointer">
          <Plus className="size-4" />
          Nova transação
        </Button>
      </div>
    </header>
  )
}
