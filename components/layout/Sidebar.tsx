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
} from "lucide-react"

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
      <div className="flex h-16 items-center justify-between px-3.5 border-b border-border overflow-hidden">
        <Link href="/dashboard" className="flex items-center gap-3 font-bold text-xl text-primary min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black">
            C
          </div>
          <span className={`transition-opacity duration-200 truncate ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"}`}>
            Cofre
          </span>
        </Link>
        <button
          onClick={toggleCollapse}
          className="hidden md:flex size-7 shrink-0 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3.5 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="size-5 shrink-0" />
              <span className={`truncate transition-opacity duration-200 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Plan Badge */}
      <div className={`p-3 m-3 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between text-xs transition-opacity duration-200 overflow-hidden ${isCollapsed ? "opacity-0 hidden" : "opacity-100"}`}>
        <div className="flex items-center gap-2 text-primary font-medium truncate">
          <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
          <span className="truncate">Plano Pro Ativo</span>
        </div>
      </div>
    </aside>
  )
}
