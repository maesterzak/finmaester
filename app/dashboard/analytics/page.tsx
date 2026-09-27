"use client"

import { Suspense, useMemo } from "react"
import { format } from "date-fns"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PeriodFilter } from "@/components/transactions/period-filter"
import { PeriodSummary } from "@/components/analytics/period-summary"
import { SpendingChart } from "@/components/analytics/spending-chart"
import {
  AveragesCard,
  BudgetPaceCard,
  CategoryBreakdownCard,
  TopTransactionsCard,
  UnusualSpendingCard,
} from "@/components/analytics/analytics-cards"
import { Skeleton } from "@/components/ui/skeleton"
import { useTransactions } from "@/hooks/useTransactions"
import { useCategories } from "@/hooks/useCategories"
import { usePeriodFilter } from "@/hooks/usePeriodFilter"
import {
  budgetPaces,
  categoryBreakdown,
  filterByRange,
  onlyExpenses,
  spendingAverages,
  summarize,
  topTransactions,
  unusualSpending,
} from "@/lib/analytics"
import { fromDateKey, previousPeriodLabel } from "@/lib/periods"

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <DashboardHeader title="Analytics" description="Understand where your money goes" />
      {/* Filters are read from the URL (useSearchParams), which needs a Suspense boundary */}
      <Suspense>
        <AnalyticsContent />
      </Suspense>
    </div>
  )
}

function AnalyticsContent() {
  const { transactions, loading: transactionsLoading } = useTransactions()
  const { categories, loading: categoriesLoading } = useCategories()
  const filter = usePeriodFilter()
  const { period, range, previousRange, label, setPeriod } = filter
  const loading = transactionsLoading || categoriesLoading

  const periodTransactions = useMemo(() => filterByRange(transactions, range), [transactions, range])
  const periodExpenses = useMemo(() => onlyExpenses(periodTransactions), [periodTransactions])

  const current = useMemo(() => summarize(periodTransactions), [periodTransactions])
  const previous = useMemo(() => summarize(filterByRange(transactions, previousRange)), [transactions, previousRange])

  const slices = useMemo(() => categoryBreakdown(periodExpenses, categories), [periodExpenses, categories])
  const monthKey = range.start.slice(0, 7)
  const paces = useMemo(
    () => (period === "month" ? budgetPaces(categories, onlyExpenses(transactions), monthKey) : []),
    [period, categories, transactions, monthKey],
  )
  const anomalies = useMemo(
    () => unusualSpending(transactions, categories, period, range),
    [transactions, categories, period, range],
  )
  const averages = useMemo(() => spendingAverages(periodExpenses, range), [periodExpenses, range])
  const largest = useMemo(() => topTransactions(periodExpenses), [periodExpenses])

  // Links into the Transactions page keep the current period
  const categoryHref = (categoryId: string) => {
    const params = new URLSearchParams({ period, date: range.start, category: categoryId })
    if (period === "custom") {
      params.set("from", range.start)
      params.set("to", range.end)
    }
    return `/dashboard/transactions?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      <PeriodFilter filter={filter}>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <PeriodSummary current={current} previous={previous} previousLabel={previousPeriodLabel[period]} />
        )}
      </PeriodFilter>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <SpendingChart transactions={transactions} period={period} range={range} label={label} />

          <div className="grid gap-6 lg:grid-cols-2">
            <CategoryBreakdownCard slices={slices} total={current.expenses} categoryHref={categoryHref} />
            <BudgetPaceCard
              paces={paces}
              isMonthView={period === "month"}
              monthLabel={format(fromDateKey(range.start), "MMMM yyyy")}
              onSwitchToMonth={() => setPeriod("month")}
            />
          </div>

          <UnusualSpendingCard anomalies={anomalies} period={period} categoryHref={categoryHref} />

          <div className="grid gap-6 lg:grid-cols-2">
            <AveragesCard averages={averages} expenseCount={periodExpenses.length} />
            <TopTransactionsCard transactions={largest} categories={categories} />
          </div>
        </>
      )}
    </div>
  )
}
