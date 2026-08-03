"use client"

import React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { DashboardAgentDock } from "@/components/dashboard/dashboard-agent-dock"
import { BottomNavBar } from "@/components/ui/bottom-nav-bar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const getNavIndex = () => {
    if (pathname === "/dashboard") return 0
    if (pathname?.startsWith("/relatorios")) return 1
    if (pathname?.startsWith("/transacoes")) return 2
    if (pathname?.startsWith("/orcamentos")) return 3
    if (pathname?.startsWith("/metas")) return 4
    if (pathname?.startsWith("/configuracoes")) return 5
    return 0
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 pb-20 md:pb-6">
        <TopBar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Floating Agent Dock at bottom right */}
      <DashboardAgentDock />

      {/* Mobile Floating Bottom Navigation Bar */}
      <div className="md:hidden">
        <BottomNavBar
          stickyBottom
          defaultIndex={getNavIndex()}
          onSelect={(idx, href) => router.push(href)}
        />
      </div>
    </div>
  )
}
