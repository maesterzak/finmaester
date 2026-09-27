import { addDays, format, subMonths } from "date-fns"
import type { Category, Transaction } from "@/lib/firebase/firestore"
import {
  budgetPaces,
  categoryBreakdown,
  filterByRange,
  indexCategories,
  normalizeSearchText,
  onlyExpenses,
  resolveCategory,
  spendingAverages,
  summarize,
  topTransactions,
  unusualSpending,
} from "@/lib/analytics"
import {
  type PeriodType,
  formatPeriodLabel,
  getPeriodRange,
  getPreviousRange,
  monthKeyOf,
  toDateKey,
} from "@/lib/periods"
import type { PeriodSnapshot, SpendingContext } from "./types"

const round = (n: number) => Math.round(n)
const clip = (text: string, max = 80) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)

function snapshot(
  period: Exclude<PeriodType, "custom">,
  transactions: Transaction[],
  categories: Category[],
  today: Date,
): PeriodSnapshot {
  const range = getPeriodRange(period, today)
  const previousRange = getPreviousRange(period, range)
  const inPeriod = filterByRange(transactions, range)
  const expenses = onlyExpenses(inPeriod)
  const totals = summarize(inPeriod)
  const previous = summarize(filterByRange(transactions, previousRange))
  const averages = spendingAverages(expenses, range, today)
  const categoriesById = indexCategories(categories)

  return {
    label: formatPeriodLabel(period, range),
    start: range.start,
    end: range.end,
    totals: {
      income: round(totals.income),
      expenses: round(totals.expenses),
      invested: round(totals.invested),
      net: round(totals.net),
      savingsRatePct: totals.savingsRate === null ? null : round(totals.savingsRate),
      transactionCount: totals.count,
    },
    previous: {
      label: formatPeriodLabel(period, previousRange),
      income: round(previous.income),
      expenses: round(previous.expenses),
    },
    categories: categoryBreakdown(expenses, categories)
      .slice(0, 10)
      .map((c) => ({ name: c.name, amount: round(c.amount), sharePct: round(c.share), count: c.count })),
    largestExpenses: topTransactions(expenses).map((t) => ({
      date: t.date.slice(0, 10),
      description: clip(t.description || ""),
      category: resolveCategory(t.categoryId, t.categoryName, categoriesById).name,
      amount: round(Number(t.amount) || 0),
    })),
    unusualSpending: unusualSpending(transactions, categories, period, range)
      .slice(0, 5)
      .map((a) => ({
        category: a.name,
        amount: round(a.current),
        previousAverage: round(a.average),
        ratio: Math.round(a.ratio * 10) / 10,
      })),
    averages: {
      dailySpend: round(averages.avgDaily),
      perTransaction: round(averages.avgTransaction),
      busiestWeekday: averages.busiestWeekday?.name ?? null,
    },
  }
}

// Expenses with the same remark 3+ times in the last 90 days — likely subscriptions or habits
function repeatedExpenses(transactions: Transaction[], today: Date) {
  const recent = onlyExpenses(
    filterByRange(transactions, { start: toDateKey(addDays(today, -89)), end: toDateKey(today) }),
  )
  const groups = new Map<string, { description: string; count: number; total: number }>()
  recent.forEach((t) => {
    const key = normalizeSearchText(t.description || "")
    if (!key) return
    const group = groups.get(key) ?? { description: clip(t.description), count: 0, total: 0 }
    group.count += 1
    group.total += Number(t.amount) || 0
    groups.set(key, group)
  })
  return [...groups.values()]
    .filter((g) => g.count >= 3)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
    .map((g) => ({ ...g, total: round(g.total), averageAmount: round(g.total / g.count) }))
}

// Builds the summary sent to the AI. Only aggregates plus the remarks of the largest and
// repeated expenses leave the browser — not the full transaction list.
export function buildSpendingContext(
  transactions: Transaction[],
  categories: Category[],
  today: Date = new Date(),
): SpendingContext {
  const monthKey = monthKeyOf(today)
  const expenses = onlyExpenses(transactions)

  const monthlyHistory = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(today, 5 - i)
    const totals = summarize(filterByRange(transactions, getPeriodRange("month", month)))
    return { month: format(month, "MMM yyyy"), income: round(totals.income), expenses: round(totals.expenses) }
  })

  return {
    currency: "NGN",
    today: format(today, "EEEE, d MMMM yyyy"),
    weekStartsOn: "Sunday",
    periods: {
      day: snapshot("day", transactions, categories, today),
      week: snapshot("week", transactions, categories, today),
      month: snapshot("month", transactions, categories, today),
    },
    monthBudgets: budgetPaces(categories, expenses, monthKey, today).map((p) => ({
      category: p.name,
      budget: round(p.budget),
      spent: round(p.spent),
      projectedMonthEnd: p.projected === null ? null : round(p.projected),
    })),
    monthlyHistory,
    repeatedExpenses: repeatedExpenses(transactions, today),
  }
}
