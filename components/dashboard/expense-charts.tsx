"use client"

import { useMemo } from "react"
import Link from "next/link"
import { addDays, endOfMonth, format, startOfMonth, subMonths } from "date-fns"
import { BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart"
import {
  EXPENSE_COLOR,
  INCOME_COLOR,
  chartAxisProps,
  chartGridProps,
  chartTooltipProps,
} from "@/components/analytics/chart-theme"
import type { Category, Transaction } from "@/lib/firebase/firestore"
import { buildTimeSeries, categoryBreakdown, filterByRange, onlyExpenses } from "@/lib/analytics"
import { formatCurrency, formatCurrencyCompact } from "@/lib/formatCurrency"
import { getPeriodRange, toDateKey } from "@/lib/periods"

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <BarChart3 className="h-10 w-10 text-muted-foreground/50 mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export function ExpenseCharts({ transactions, categories }: { transactions: Transaction[]; categories: Category[] }) {
  const todayKey = toDateKey(new Date())

  const { monthly, daily, slices, monthLabel } = useMemo(() => {
    const now = new Date()
    const yearRange = { start: toDateKey(startOfMonth(subMonths(now, 11))), end: toDateKey(endOfMonth(now)) }
    const last30 = { start: toDateKey(addDays(now, -29)), end: toDateKey(now) }
    return {
      monthly: buildTimeSeries(transactions, "year", yearRange),
      daily: buildTimeSeries(transactions, "custom", last30),
      slices: categoryBreakdown(
        onlyExpenses(filterByRange(transactions, getPeriodRange("month", now))),
        categories,
      ).slice(0, 8),
      monthLabel: format(now, "MMMM"),
    }
    // todayKey recomputes the ranges when the day rolls over
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, categories, todayKey])

  const hasMonthly = monthly.some((m) => m.income > 0 || m.expense > 0)
  const hasDaily = daily.some((d) => d.expense > 0)
  const monthTotal = slices.reduce((s, c) => s + c.amount, 0)

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Spending Trends</CardTitle>
        <CardDescription>Income, expenses and where your money goes</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              12 months
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs sm:text-sm">
              Categories
            </TabsTrigger>
            <TabsTrigger value="daily" className="text-xs sm:text-sm">
              30 days
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <div className="h-[260px] sm:h-[320px] w-full">
              {hasMonthly ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={INCOME_COLOR} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={INCOME_COLOR} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="trendExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={EXPENSE_COLOR} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={EXPENSE_COLOR} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...chartGridProps} />
                    <XAxis dataKey="label" {...chartAxisProps} minTickGap={4} />
                    <YAxis {...chartAxisProps} width={56} tickFormatter={(v: number) => formatCurrencyCompact(v)} />
                    <Tooltip {...chartTooltipProps} formatter={(value: number) => formatCurrency(value)} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Area type="monotone" dataKey="income" name="Income" stroke={INCOME_COLOR} fill="url(#trendIncome)" />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      name="Expenses"
                      stroke={EXPENSE_COLOR}
                      fill="url(#trendExpense)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No income or expenses in the last 12 months." />
              )}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-0">
            {slices.length === 0 ? (
              <div className="h-[260px]">
                <EmptyChart message={`No expenses in ${monthLabel} yet.`} />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-[200px_1fr] items-center">
                <div className="relative h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={slices}
                        dataKey="amount"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={88}
                        paddingAngle={slices.length > 1 ? 2 : 0}
                        stroke="none"
                      >
                        {slices.map((s) => (
                          <Cell key={s.id} fill={s.color} />
                        ))}
                      </Pie>
                      <Tooltip {...chartTooltipProps} formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[10px] text-muted-foreground">{monthLabel}</p>
                    <p className="text-sm font-bold">{formatCurrencyCompact(monthTotal)}</p>
                  </div>
                </div>
                <ul className="space-y-2 min-w-0">
                  {slices.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="truncate">{s.name}</span>
                      </span>
                      <span className="whitespace-nowrap">
                        <span className="font-semibold">{formatCurrency(s.amount)}</span>
                        <span className="text-xs text-muted-foreground"> · {s.share.toFixed(0)}%</span>
                      </span>
                    </li>
                  ))}
                  <li className="pt-1">
                    <Link href="/dashboard/analytics" className="text-xs font-medium text-primary hover:underline">
                      Full breakdown in Analytics →
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </TabsContent>

          <TabsContent value="daily" className="mt-0">
            <div className="h-[260px] sm:h-[320px] w-full">
              {hasDaily ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={daily} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid {...chartGridProps} />
                    <XAxis dataKey="label" {...chartAxisProps} minTickGap={16} />
                    <YAxis {...chartAxisProps} width={56} tickFormatter={(v: number) => formatCurrencyCompact(v)} />
                    <Tooltip {...chartTooltipProps} formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="expense" name="Expenses" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No expenses in the last 30 days." />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
