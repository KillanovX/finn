"use client"

import { Cell, Pie, PieChart } from "recharts"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { useBalance } from "@/lib/balance-context"
import { categories } from "@/lib/finance-data"
import { AnimatedAmount } from "@/components/ui/animated-amount"

const chartConfig = {
  value: { label: "Valor" },
} satisfies ChartConfig

export function CategoryChart() {
  const { formatCurrency, isBalanceVisible } = useBalance()
  const total = categories.reduce((sum, c) => sum + c.value, 0)

  return (
    <div className="rounded-3xl bg-card p-5 text-card-foreground">
      <h2 className="text-base font-semibold">Gastos por categoria</h2>
      <p className="text-sm text-muted-foreground">Julho 2026</p>

      <div className="relative mx-auto mt-4 w-full">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-44">
          <PieChart>
            <Pie
              data={categories}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={2}
              strokeWidth={0}
            >
              {categories.map((c) => (
                <Cell key={c.name} fill={c.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-xl font-semibold tracking-tight">
            <AnimatedAmount value={formatCurrency(total)} isVisible={isBalanceVisible} />
          </span>
        </div>
      </div>

      <ul className="mt-4 space-y-2.5">
        {categories.map((c) => (
          <li key={c.name} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 rounded-full" style={{ background: c.color }} />
            <span className="text-muted-foreground">{c.name}</span>
            <span className="ml-auto font-medium">
              <AnimatedAmount value={formatCurrency(c.value)} isVisible={isBalanceVisible} />
            </span>
            <span className="w-10 text-right text-xs text-muted-foreground">
              {Math.round((c.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
