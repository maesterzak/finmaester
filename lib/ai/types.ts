// Shapes shared by the AI advisor (browser) and the /api/ai routes (server)

export interface PeriodSnapshot {
  label: string
  start: string
  end: string
  totals: {
    income: number
    expenses: number
    invested: number
    net: number
    savingsRatePct: number | null
    transactionCount: number
  }
  previous: { label: string; income: number; expenses: number }
  categories: { name: string; amount: number; sharePct: number; count: number }[]
  largestExpenses: { date: string; description: string; category: string; amount: number }[]
  unusualSpending: { category: string; amount: number; previousAverage: number; ratio: number }[]
  averages: { dailySpend: number; perTransaction: number; busiestWeekday: string | null }
}

export interface SpendingContext {
  // ISO 4217 code of the currency all amounts are in, e.g. "USD"
  currency: string
  today: string
  weekStartsOn: "Sunday"
  periods: { day: PeriodSnapshot; week: PeriodSnapshot; month: PeriodSnapshot }
  monthBudgets: { category: string; budget: number; spent: number; projectedMonthEnd: number | null }[]
  monthlyHistory: { month: string; income: number; expenses: number }[]
  repeatedExpenses: { description: string; count: number; total: number; averageAmount: number }[]
}

export interface PeriodInsight {
  headline: string
  points: string[]
}

export interface SpendingAnalysis {
  overview: string
  periods: { day: PeriodInsight; week: PeriodInsight; month: PeriodInsight }
  habits: string[]
  suggestions: { title: string; detail: string; category: string; estimatedMonthlySavings: number }[]
  alerts: string[]
}

export interface ChatMessage {
  role: "user" | "model"
  text: string
}
