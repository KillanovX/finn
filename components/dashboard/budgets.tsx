import { budgets, currency } from "@/lib/finance-data"

export function Budgets() {
  return (
    <div className="rounded-3xl bg-card p-5 text-card-foreground">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Orçamentos</h2>
          <p className="text-sm text-muted-foreground">Acompanhe seus limites</p>
        </div>
      </div>

      <ul className="space-y-4">
        {budgets.map((b) => {
          const pct = Math.min((b.spent / b.limit) * 100, 100)
          const over = b.spent > b.limit
          return (
            <li key={b.name}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium">{b.name}</span>
                <span className={over ? "text-destructive" : "text-muted-foreground"}>
                  {currency(b.spent)} / {currency(b.limit)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full ${over ? "bg-destructive" : "bg-chart-1"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {over && (
                <p className="mt-1 text-xs text-destructive">
                  Limite excedido em {currency(b.spent - b.limit)}
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
