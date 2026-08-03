"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useBalance } from "@/lib/balance-context"
import { cashflow } from "@/lib/finance-data"

const chartConfig = {
  entradas: { label: "Entradas", color: "var(--chart-1)" },
  saidas: { label: "Saídas", color: "var(--chart-2)" },
} satisfies ChartConfig

export function CashflowChart() {
  const { formatCurrency } = useBalance()

  return (
    <div className="rounded-3xl bg-card p-5 text-card-foreground">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Fluxo de caixa</h2>
          <p className="text-sm text-muted-foreground">Entradas x Saídas · últimos 7 meses</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-chart-1" />
            Entradas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-chart-2" />
            Saídas
          </span>
        </div>
      </div>
      <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
        <BarChart data={cashflow} barGap={6} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} dy={8} />
          <ChartTooltip
            cursor={{ fill: "var(--secondary)", radius: 8 }}
            content={
              <ChartTooltipContent
                formatter={(value) => (
                  <span className="font-mono font-medium text-foreground tabular-nums">
                    {formatCurrency(Number(value))}
                  </span>
                )}
              />
            }
          />
          <Bar dataKey="entradas" fill="var(--color-entradas)" radius={[6, 6, 0, 0]} maxBarSize={22} />
          <Bar dataKey="saidas" fill="var(--color-saidas)" radius={[6, 6, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
