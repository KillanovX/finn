import { create } from "zustand"
import { persist } from "zustand/middleware"

export type AccountType = "CHECKING" | "SAVINGS" | "CREDIT" | "INVESTMENT" | "WALLET"
export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER"
export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"

export interface Account {
  id: string
  name: string
  type: AccountType
  bank?: string
  balance: number
  color: string
  icon?: string
  isDefault?: boolean
  creditLimit?: number
  closingDay?: number
  dueDay?: number
}

export interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  category: string
  subcategory?: string
  date: string
  accountId: string
  tags?: string[]
  isConfirmed?: boolean
  notes?: string
}

export interface Budget {
  id: string
  category: string
  limitAmount: number
  spentAmount: number
  color: string
  alertAtPercent: number
  rollover?: boolean
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
  deadline?: string
  category: "EMERGENCY" | "TRAVEL" | "ASSET" | "VEHICLE" | "EDUCATION" | "INVESTMENT" | "OTHER"
  color: string
  icon?: string
  isCompleted?: boolean
}

export interface Recurrence {
  id: string
  description: string
  amount: number
  type: TransactionType
  category: string
  accountId: string
  frequency: RecurrenceFrequency
  nextDueDate: string
  isActive: boolean
}

interface FinanceStoreState {
  accounts: Account[]
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
  recurrences: Recurrence[]

  // Computed KPI Getters
  getTotalBalance: () => number
  getMonthlyIncome: () => number
  getMonthlyExpenses: () => number
  getSavingsRate: () => number

  // Actions
  addTransaction: (t: Omit<Transaction, "id">) => void
  deleteTransaction: (id: string) => void
  addAccount: (a: Omit<Account, "id">) => void
  updateAccount: (id: string, a: Partial<Account>) => void
  addBudget: (b: Omit<Budget, "id" | "spentAmount">) => void
  updateBudget: (id: string, b: Partial<Budget>) => void
  addGoal: (g: Omit<Goal, "id" | "savedAmount">) => void
  depositToGoal: (goalId: string, amount: number, accountId?: string) => void
  addRecurrence: (r: Omit<Recurrence, "id">) => void
  toggleRecurrence: (id: string) => void
}

const initialAccounts: Account[] = [
  { id: "acc-1", name: "Nubank Conta", type: "CHECKING", bank: "Nubank", balance: 3420.0, color: "#8b5cf6", isDefault: true },
  { id: "acc-2", name: "Itaú Corrente", type: "CHECKING", bank: "Itaú", balance: 1200.0, color: "#f97316" },
  { id: "acc-3", name: "Caixa Poupança", type: "SAVINGS", bank: "Caixa", balance: 8600.0, color: "#3b82f6" },
  { id: "acc-4", name: "XP Investimentos", type: "INVESTMENT", bank: "XP", balance: 35030.75, color: "#10b981" },
  { id: "acc-5", name: "Nubank Crédito", type: "CREDIT", bank: "Nubank", balance: -1340.0, color: "#ec4899", creditLimit: 8000, closingDay: 19, dueDay: 26 },
]

const initialTransactions: Transaction[] = [
  { id: "tx-1", description: "Supermercado Pão de Açúcar", amount: 348.9, type: "EXPENSE", category: "Alimentação", date: "2026-08-01", accountId: "acc-1" },
  { id: "tx-2", description: "Salário — Acme Ltda", amount: 12400.0, type: "INCOME", category: "Receita", date: "2026-08-01", accountId: "acc-1" },
  { id: "tx-3", description: "Uber Viagem", amount: 32.5, type: "EXPENSE", category: "Transporte", date: "2026-07-31", accountId: "acc-1" },
  { id: "tx-4", description: "Assinatura Netflix", amount: 55.9, type: "EXPENSE", category: "Lazer", date: "2026-07-30", accountId: "acc-5" },
  { id: "tx-5", description: "Aluguel Residencial", amount: 2800.0, type: "EXPENSE", category: "Moradia", date: "2026-07-28", accountId: "acc-2" },
  { id: "tx-6", description: "Projeto Freelance Design", amount: 1600.0, type: "INCOME", category: "Receita", date: "2026-07-25", accountId: "acc-1" },
  { id: "tx-7", description: "Farmácia Drogasil", amount: 89.7, type: "EXPENSE", category: "Saúde", date: "2026-07-24", accountId: "acc-1" },
]

const initialBudgets: Budget[] = [
  { id: "b-1", category: "Alimentação", limitAmount: 2000, spentAmount: 1850, color: "#22c55e", alertAtPercent: 80 },
  { id: "b-2", category: "Lazer", limitAmount: 900, spentAmount: 980, color: "#ec4899", alertAtPercent: 80 },
  { id: "b-3", category: "Transporte", limitAmount: 1500, spentAmount: 1120, color: "#f59e0b", alertAtPercent: 80 },
  { id: "b-4", category: "Compras", limitAmount: 1200, spentAmount: 640, color: "#3b82f6", alertAtPercent: 80 },
]

const initialGoals: Goal[] = [
  { id: "g-1", name: "Reserva de Emergência", targetAmount: 46000, savedAmount: 28000, category: "EMERGENCY", color: "#10b981", icon: "Shield" },
  { id: "g-2", name: "Viagem para Europa", targetAmount: 15000, savedAmount: 6500, deadline: "2026-12-15", category: "TRAVEL", color: "#8b5cf6", icon: "Plane" },
  { id: "g-3", name: "Entrada do Carro", targetAmount: 25000, savedAmount: 12000, deadline: "2027-04-10", category: "VEHICLE", color: "#f59e0b", icon: "Car" },
]

const initialRecurrences: Recurrence[] = [
  { id: "rec-1", description: "Aluguel Residencial", amount: 2800, type: "EXPENSE", category: "Moradia", accountId: "acc-2", frequency: "MONTHLY", nextDueDate: "2026-08-28", isActive: true },
  { id: "rec-2", description: "Assinatura Netflix", amount: 55.9, type: "EXPENSE", category: "Lazer", accountId: "acc-5", frequency: "MONTHLY", nextDueDate: "2026-08-30", isActive: true },
  { id: "rec-3", description: "Plano de Saúde", amount: 450, type: "EXPENSE", category: "Saúde", accountId: "acc-1", frequency: "MONTHLY", nextDueDate: "2026-09-05", isActive: true },
]

export const useFinanceStore = create<FinanceStoreState>()(
  persist(
    (set, get) => ({
      accounts: initialAccounts,
      transactions: initialTransactions,
      budgets: initialBudgets,
      goals: initialGoals,
      recurrences: initialRecurrences,

      getTotalBalance: () => {
        return get().accounts.reduce((sum, acc) => sum + acc.balance, 0)
      },

      getMonthlyIncome: () => {
        return get()
          .transactions.filter((t) => t.type === "INCOME")
          .reduce((sum, t) => sum + t.amount, 0)
      },

      getMonthlyExpenses: () => {
        return get()
          .transactions.filter((t) => t.type === "EXPENSE")
          .reduce((sum, t) => sum + t.amount, 0)
      },

      getSavingsRate: () => {
        const income = get().getMonthlyIncome()
        const expenses = get().getMonthlyExpenses()
        if (income <= 0) return 0
        return Math.max(0, (income - expenses) / income)
      },

      addTransaction: (tx) => {
        const newId = `tx-${Date.now()}`
        const newTransaction = { ...tx, id: newId }
        set((state) => {
          const updatedAccounts = state.accounts.map((acc) => {
            if (acc.id === tx.accountId) {
              const delta = tx.type === "INCOME" ? tx.amount : -tx.amount
              return { ...acc, balance: acc.balance + delta }
            }
            return acc
          })

          const updatedBudgets = state.budgets.map((b) => {
            if (b.category === tx.category && tx.type === "EXPENSE") {
              return { ...b, spentAmount: b.spentAmount + tx.amount }
            }
            return b
          })

          return {
            transactions: [newTransaction, ...state.transactions],
            accounts: updatedAccounts,
            budgets: updatedBudgets,
          }
        })
      },

      deleteTransaction: (id) => {
        set((state) => {
          const tx = state.transactions.find((t) => t.id === id)
          if (!tx) return state

          const updatedAccounts = state.accounts.map((acc) => {
            if (acc.id === tx.accountId) {
              const delta = tx.type === "INCOME" ? -tx.amount : tx.amount
              return { ...acc, balance: acc.balance + delta }
            }
            return acc
          })

          return {
            transactions: state.transactions.filter((t) => t.id !== id),
            accounts: updatedAccounts,
          }
        })
      },

      addAccount: (acc) => {
        const newAcc = { ...acc, id: `acc-${Date.now()}` }
        set((state) => ({ accounts: [...state.accounts, newAcc] }))
      },

      updateAccount: (id, accData) => {
        set((state) => ({
          accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...accData } : a)),
        }))
      },

      addBudget: (b) => {
        const newBudget = { ...b, id: `b-${Date.now()}`, spentAmount: 0 }
        set((state) => ({ budgets: [...state.budgets, newBudget] }))
      },

      updateBudget: (id, bData) => {
        set((state) => ({
          budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...bData } : b)),
        }))
      },

      addGoal: (g) => {
        const newGoal = { ...g, id: `g-${Date.now()}`, savedAmount: 0, isCompleted: false }
        set((state) => ({ goals: [...state.goals, newGoal] }))
      },

      depositToGoal: (goalId, amount, accountId) => {
        set((state) => {
          const updatedGoals = state.goals.map((g) => {
            if (g.id === goalId) {
              const newSaved = g.savedAmount + amount
              return {
                ...g,
                savedAmount: newSaved,
                isCompleted: newSaved >= g.targetAmount,
              }
            }
            return g
          })

          let updatedAccounts = state.accounts
          if (accountId) {
            updatedAccounts = state.accounts.map((acc) =>
              acc.id === accountId ? { ...acc, balance: acc.balance - amount } : acc
            )
          }

          return { goals: updatedGoals, accounts: updatedAccounts }
        })
      },

      addRecurrence: (r) => {
        const newRec = { ...r, id: `rec-${Date.now()}` }
        set((state) => ({ recurrences: [...state.recurrences, newRec] }))
      },

      toggleRecurrence: (id) => {
        set((state) => ({
          recurrences: state.recurrences.map((r) =>
            r.id === id ? { ...r, isActive: !r.isActive } : r
          ),
        }))
      },
    }),
    {
      name: "cofre-finance-store",
    }
  )
)
