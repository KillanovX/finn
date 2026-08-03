"use client"

import React, { useState } from "react"
import { User, Settings, Shield, Bell, Moon, Sun, DollarSign, Database, Check } from "lucide-react"
import { useBalance } from "@/lib/balance-context"

export default function SettingsPage() {
  const { isBalanceVisible, toggleBalance } = useBalance()

  const [name, setName] = useState("Marina Silva")
  const [email, setEmail] = useState("marina.silva@exemplo.com")
  const [income, setIncome] = useState("12400")
  const [monthStartDay, setMonthStartDay] = useState("1")
  const [rule503020, setRule503020] = useState(true)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações & Perfil</h2>
        <p className="text-sm text-muted-foreground">Gerencie suas preferências de conta, privacidade e aplicativo</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="rounded-3xl bg-card border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border text-foreground font-bold">
            <User className="size-5 text-primary" />
            <span>Perfil do Usuário</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Financial Preferences Card */}
        <div className="rounded-3xl bg-card border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border text-foreground font-bold">
            <DollarSign className="size-5 text-emerald-500" />
            <span>Preferências Financeiras</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Renda Mensal Estimada (R$)</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Dia do Início do Mês Financeiro</label>
              <input
                type="number"
                min="1"
                max="31"
                value={monthStartDay}
                onChange={(e) => setMonthStartDay(e.target.value)}
                className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-semibold text-foreground">Regra Automática 50 / 30 / 20</p>
              <p className="text-xs text-muted-foreground">Sugerir orçamentos (50% necessidades, 30% desejos, 20% poupança)</p>
            </div>
            <button
              type="button"
              onClick={() => setRule503020(!rule503020)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                rule503020 ? "bg-primary" : "bg-secondary"
              }`}
            >
              <div
                className={`size-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  rule503020 ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="rounded-3xl bg-card border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border text-foreground font-bold">
            <Shield className="size-5 text-amber-500" />
            <span>Privacidade & Ocultação de Valores</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Ocultar Valores por Padrão</p>
              <p className="text-xs text-muted-foreground">Os saldos do aplicativo iniciam mascarados como R$ ******</p>
            </div>
            <button
              type="button"
              onClick={toggleBalance}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                !isBalanceVisible ? "bg-primary" : "bg-secondary"
              }`}
            >
              <div
                className={`size-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  !isBalanceVisible ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-transform active:scale-95 cursor-pointer"
          >
            Salvar Alterações
          </button>
          {savedSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 animate-in fade-in">
              <Check className="size-4" /> Alterações salvas com sucesso!
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
