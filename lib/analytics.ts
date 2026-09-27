import { format, getDay, getDaysInMonth } from "date-fns"
import type { Category, Transaction } from "@/lib/firebase/firestore"
import { DEFAULT_CATEGORY_COLOR } from "@/lib/category-icons"
import {
  type DateRange,
  type PeriodType,
  eachDayKey,
  eachMonthKey,
  fromDateKey,
  getPreviousRange,
  isInRange,
  monthKeyOf,
  rangeLengthInDays,
  toDateKey,
} from "@/lib/periods"

export const UNCATEGORIZED_ID = "uncategorized"
const UNCATEGORIZED_COLOR = "hsl(0, 0%, 55%)"

export const filterByRange = (transactions: Transaction[], range: DateRange) =>
  transactions.filter((t) => !!t.date && isInRange(t.date, range))

export const onlyExpenses = (transactions: Transaction[]) => transactions.filter((t) => t.type === "expense")

const sumAmounts = (transactions: Transaction[]) => transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

export interface PeriodTotals {
  income: number
  expenses: number
  invested: number
  net: number
  savingsRate: number | null
  count: number
}

export function summarize(transactions: Transaction[]): PeriodTotals {
  const income = sumAmounts(transactions.filter((t) => t.type === "income"))
  const expenses = sumAmounts(transactions.filter((t) => t.type === "expense"))
  const invested = sumAmounts(transactions.filter((t) => t.type === "investment"))
  const net = income - expenses
  return {
    income,
    expenses,
    invested,
    net,
    savingsRate: income > 0 ? (net / income) * 100 : null,
    count: transactions.length,
  }
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return ((current - previous) / Math.abs(previous)) * 100
}

// ---------- Category lookup ----------

// Type aliases (not interfaces) so these can be passed straight to recharts data props
export type ResolvedCategory = {
  id: string
  name: string
  color: string
  icon: string
}

export function resolveCategory(
  categoryId: string | undefined,
  fallbackName: string | undefined,
  categoriesById: Map<string, Category>,
): ResolvedCategory {
  const category = categoryId ? categoriesById.get(categoryId) : undefined
  if (category) {
    return { id: category.id!, name: category.name, color: category.color || DEFAULT_CATEGORY_COLOR, icon: category.icon }
  }
  // Deleted category or no category: keep the name saved on the transaction
  return {
    id: categoryId || UNCATEGORIZED_ID,
    name: fallbackName || "Uncategorized",
    color: UNCATEGORIZED_COLOR,
    icon: "ShoppingBag",
  }
}

export const indexCategories = (categories: Category[]) =>
  new Map(categories.filter((c) => c.id).map((c) => [c.id!, c]))

const sumByCategory = (expenses: Transaction[]) => {
  const totals = new Map<string, number>()
  expenses.forEach((t) => {
    const id = t.categoryId || UNCATEGORIZED_ID
    totals.set(id, (totals.get(id) || 0) + (Number(t.amount) || 0))
  })
  return totals
}

// ---------- Time series ----------

export interface TimeBucket {
  key: string
  label: string
  income: number
  expense: number
}

export function buildTimeSeries(transactions: Transaction[], period: PeriodType, range: DateRange): TimeBucket[] {
  const days = rangeLengthInDays(range)
  const monthly = period === "year" || days > 62

  const buckets: TimeBucket[] = monthly
    ? eachMonthKey(range).map((key) => ({
        key,
        label: format(fromDateKey(`${key}-01`), days > 366 ? "MMM yy" : "MMM"),
        income: 0,
        expense: 0,
      }))
    : eachDayKey(range).map((key) => ({
        key,
        label: format(fromDateKey(key), period === "week" ? "EEE" : "d MMM"),
        income: 0,
        expense: 0,
      }))

  const byKey = new Map(buckets.map((b) => [b.key, b]))
  filterByRange(transactions, range).forEach((t) => {
    const bucket = byKey.get(monthly ? t.date.slice(0, 7) : t.date.slice(0, 10))
    if (!bucket) return
    if (t.type === "income") bucket.income += Number(t.amount) || 0
    if (t.type === "expense") bucket.expense += Number(t.amount) || 0
  })
  return buckets
}

// ---------- Category breakdown ----------

export type CategorySlice = ResolvedCategory & {
  amount: number
  count: number
  share: number
}

export function categoryBreakdown(expenses: Transaction[], categories: Category[]): CategorySlice[] {
  const categoriesById = indexCategories(categories)
  const slices = new Map<string, CategorySlice>()

  expenses.forEach((t) => {
    const resolved = resolveCategory(t.categoryId, t.categoryName, categoriesById)
    const slice = slices.get(resolved.id) ?? { ...resolved, amount: 0, count: 0, share: 0 }
    slice.amount += Number(t.amount) || 0
    slice.count += 1
    slices.set(resolved.id, slice)
  })

  const total = sumAmounts(expenses)
  return [...slices.values()]
    .map((s) => ({ ...s, share: total > 0 ? (s.amount / total) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount)
}

// ---------- Budget vs actual ----------

export type BudgetStatus = "good" | "warning" | "projected-over" | "over"

export interface BudgetPace extends ResolvedCategory {
  budget: number
  spent: number
  projected: number | null
  percentUsed: number
  status: BudgetStatus
}

export function budgetPaces(
  categories: Category[],
  allExpenses: Transaction[],
  monthKey: string,
  today: Date = new Date(),
): BudgetPace[] {
  const monthStart = fromDateKey(`${monthKey}-01`)
  const daysInMonth = getDaysInMonth(monthStart)
  const currentMonthKey = monthKeyOf(today)
  const spentByCategory = sumByCategory(allExpenses.filter((t) => t.date?.slice(0, 7) === monthKey))

  return categories
    .filter((c) => c.id && (c.monthlyBudgets?.[monthKey] || 0) > 0)
    .map((c) => {
      const budget = c.monthlyBudgets![monthKey]
      const spent = spentByCategory.get(c.id!) || 0

      let projected: number | null = null
      if (monthKey === currentMonthKey) projected = (spent / today.getDate()) * daysInMonth
      else if (monthKey < currentMonthKey) projected = spent

      const percentUsed = (spent / budget) * 100
      let status: BudgetStatus = "good"
      if (spent > budget) status = "over"
      else if (projected !== null && projected > budget) status = "projected-over"
      else if (percentUsed >= 75) status = "warning"

      return {
        id: c.id!,
        name: c.name,
        color: c.color || DEFAULT_CATEGORY_COLOR,
        icon: c.icon,
        budget,
        spent,
        projected,
        percentUsed,
        status,
      }
    })
    .sort((a, b) => b.percentUsed - a.percentUsed)
}

// ---------- Unusual spending ----------

export interface SpendingAnomaly extends ResolvedCategory {
  current: number
  average: number
  ratio: number
}

// Flags categories whose spending this period is well above their average over the previous periods
export function unusualSpending(
  transactions: Transaction[],
  categories: Category[],
  period: PeriodType,
  range: DateRange,
  lookback = 3,
  threshold = 1.5,
): SpendingAnomaly[] {
  const expenses = onlyExpenses(transactions)
  const current = sumByCategory(filterByRange(expenses, range))

  const history = new Map<string, number>()
  let previous = range
  for (let i = 0; i < lookback; i++) {
    previous = getPreviousRange(period, previous)
    sumByCategory(filterByRange(expenses, previous)).forEach((amount, id) => {
      history.set(id, (history.get(id) || 0) + amount)
    })
  }

  const categoriesById = indexCategories(categories)
  const fallbackNames = new Map(expenses.map((t) => [t.categoryId || UNCATEGORIZED_ID, t.categoryName]))

  const anomalies: SpendingAnomaly[] = []
  current.forEach((amount, id) => {
    const average = (history.get(id) || 0) / lookback
    if (average > 0 && amount >= average * threshold) {
      anomalies.push({
        ...resolveCategory(id === UNCATEGORIZED_ID ? undefined : id, fallbackNames.get(id), categoriesById),
        current: amount,
        average,
        ratio: amount / average,
      })
    }
  })
  return anomalies.sort((a, b) => b.ratio - a.ratio)
}

// ---------- Averages ----------

export interface SpendingAverages {
  avgDaily: number
  avgTransaction: number
  daysCounted: number
  busiestWeekday: { name: string; amount: number } | null
}

export function spendingAverages(expenses: Transaction[], range: DateRange, today: Date = new Date()): SpendingAverages {
  const todayKey = toDateKey(today)
  let daysCounted = rangeLengthInDays(range)
  if (range.start > todayKey) daysCounted = 0
  else if (range.end > todayKey) daysCounted = rangeLengthInDays({ start: range.start, end: todayKey })

  const total = sumAmounts(expenses)

  let busiestWeekday: SpendingAverages["busiestWeekday"] = null
  if (rangeLengthInDays(range) >= 7 && expenses.length > 0) {
    const byWeekday = new Array(7).fill(0)
    expenses.forEach((t) => {
      byWeekday[getDay(fromDateKey(t.date))] += Number(t.amount) || 0
    })
    const day = byWeekday.indexOf(Math.max(...byWeekday))
    // 2023-01-01 was a Sunday, so day offsets map straight to weekday names
    busiestWeekday = { name: format(new Date(2023, 0, 1 + day), "EEEE"), amount: byWeekday[day] }
  }

  return {
    avgDaily: daysCounted > 0 ? total / daysCounted : 0,
    avgTransaction: expenses.length > 0 ? total / expenses.length : 0,
    daysCounted,
    busiestWeekday,
  }
}

export const topTransactions = (expenses: Transaction[], count = 5) =>
  [...expenses].sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0)).slice(0, count)

// ---------- Remark search ----------

// Lowercases and collapses whitespace so "Gift  to AI" matches "gift to ai"
export const normalizeSearchText = (text: string) => text.toLowerCase().replace(/\s+/g, " ").trim()

// Case-insensitive match of the query anywhere in the transaction's remark (description)
export const matchesRemark = (transaction: Transaction, normalizedQuery: string) =>
  !!normalizedQuery && normalizeSearchText(transaction.description || "").includes(normalizedQuery)
