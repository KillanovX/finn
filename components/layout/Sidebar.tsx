"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Target,
  Wallet,
  CalendarDays,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react"
import { useBalance } from "@/lib/balance-context"
import { useFinanceStore } from "@/store/useFinanceStore"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transações", href: "/transacoes", icon: Receipt },
  { name: "Orçamentos", href: "/orcamentos", icon: PiggyBank },
  { name: "Metas", href: "/metas", icon: Target },
  { name: "Contas", href: "/contas", icon: Wallet },
  { name: "Recorrências", href: "/recorrencias", icon: CalendarDays },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { isBalanceVisible, toggleBalance, formatCurrency } = useBalance()
  const getTotalBalance = useFinanceStore((state) => state.getTotalBalance)

  const balance = getTotalBalance()

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed")
    if (saved !== null) {
      setIsCollapsed(saved === "true")
    }
  }, [])

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem("sidebar_collapsed", String(next))
      return next
    })
  }

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 bg-card border-r border-border transition-all duration-300 z-30 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black">
              C
            </div>
            <span>Cofre</span>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/dashboard" className="mx-auto flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black">
            C
          </Link>
        )}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex size-7 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      {/* Balance Summary Card */}
      {!isCollapsed && (
        <div className="m-3 p-3.5 rounded-2xl bg-secondary/60 border border-border/50 flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Saldo total</span>
            <button
              onClick={toggleBalance}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {isBalanceVisible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            </button>
          </div>
          <p className="text-base font-semibold tracking-tight text-foreground truncate">
            {isBalanceVisible ? formatCurrency(balance) : "R$ ******"}
          </p>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              } ${isCollapsed ? "justify-center px-0" : ""}`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="size-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer Plan Badge */}
      {!isCollapsed && (
        <div className="p-3 m-3 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-primary font-medium">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>Plano Pro Ativo</span>
          </div>
        </div>
      )}
    </aside>
  )
}
