"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type BalanceContextType = {
  isBalanceVisible: boolean
  toggleBalance: () => void
  formatCurrency: (value: number, detailed?: boolean) => string
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined)

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  // Valores ocultos por padrão ao abrir o app
  const [isBalanceVisible, setIsBalanceVisible] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("cofre_show_balance")
    if (saved !== null) {
      setIsBalanceVisible(saved === "true")
    } else {
      setIsBalanceVisible(false)
    }
  }, [])

  const toggleBalance = () => {
    setIsBalanceVisible((prev) => {
      const next = !prev
      localStorage.setItem("cofre_show_balance", String(next))
      return next
    })
  }

  const formatCurrency = (value: number, detailed = false) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: detailed ? 2 : 0,
    }).format(value)
  }

  return (
    <BalanceContext.Provider value={{ isBalanceVisible, toggleBalance, formatCurrency }}>
      {children}
    </BalanceContext.Provider>
  )
}

export function useBalance() {
  const context = useContext(BalanceContext)
  if (!context) {
    throw new Error("useBalance must be used within a BalanceProvider")
  }
  return context
}
