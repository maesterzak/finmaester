import { Transaction } from "@/lib/firebase/firestore"

export interface SummaryData {
  income: number
  expenses: number
  balance: number
}

export function calculateSummary(transactions: Transaction[]): SummaryData {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = income - expenses

  return { income, expenses, balance }
}

export function calculateSummaryByPeriod(
  transactions: Transaction[],
  period: "daily" | "weekly" | "monthly" | "yearly",
  specificMonth?: string // e.g. "2025-11"
): SummaryData {
  const now = new Date()
  let startDate: Date
  let endDate: Date = new Date()

  // If a specific month is provided (YYYY-MM)
  if (specificMonth) {
    const [year, month] = specificMonth.split("-").map(Number)

    startDate = new Date(year, month - 1, 1) // first day of the month
    endDate = new Date(year, month, 0) // last day of the month

  } else {
    // Fall back to default behavior
    switch (period) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break

      case "weekly":
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        break

      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break

      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
    }
  }

  // Filter by date range
  const filteredTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date)
    return transactionDate >= startDate && transactionDate <= endDate
  })

  return calculateSummary(filteredTransactions)
}