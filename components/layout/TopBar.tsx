"use client"

import React, { useState } from "react"
import { Bell, Check, Hand, Sparkles, User, Search } from "lucide-react"

export function TopBar() {
  const [hasUnread, setHasUnread] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)

  const currentDate = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  const notifications = [
    { id: 1, title: "Alerta de Orçamento", body: "Você atingiu 80% do limite de Alimentação.", time: "Há 10 min", read: false },
    { id: 2, title: "Recorrência Próxima", body: "Aluguel Residencial vence em 3 dias.", time: "Há 1 hora", read: false },
  ]

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      {/* Date & Greeting */}
      <div className="flex flex-col">
        <h1 className="text-base font-semibold tracking-tight text-foreground sm:text-lg flex items-center gap-1.5">
          Olá, Marina <Hand className="size-4 text-amber-500 inline" />
        </h1>
        <p className="text-xs text-muted-foreground capitalize">{currentDate}</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar mockup */}
        <div className="hidden md:flex items-center gap-2 rounded-full bg-secondary/80 px-3 py-1.5 text-xs text-muted-foreground border border-border/50">
          <Search className="size-3.5" />
          <span>Buscar transações... (Ctrl+K)</span>
        </div>

        {/* Notifications Dropdown Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex size-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground cursor-pointer"
            aria-label="Central de notificações"
          >
            <Bell className="size-4" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl bg-card border border-border p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                <span className="text-xs font-semibold text-foreground">Notificações</span>
                <button
                  onClick={() => {
                    setHasUnread(false)
                    setShowNotifications(false)
                  }}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Check className="size-3" />
                  Marcar como lidas
                </button>
              </div>

              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-secondary/50 text-xs flex flex-col gap-0.5">
                    <div className="flex items-center justify-between font-medium text-foreground">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-muted-foreground">{n.time}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{n.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm border border-primary/20">
          M
        </div>
      </div>
    </header>
  )
}
