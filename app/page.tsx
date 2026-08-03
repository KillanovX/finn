"use client"

import DashboardPage from "@/app/(app)/dashboard/page"
import AppLayout from "@/app/(app)/layout"

export default function RootPage() {
  return (
    <AppLayout>
      <DashboardPage />
    </AppLayout>
  )
}
