"use client"

import Link from "next/link"
import { format } from "date-fns"
import { AlertTriangle, CalendarDays, CheckCircle2, PieChart as PieChartIcon, Receipt, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "@/components/ui/chart"
import { chartTooltipProps } from "./chart-theme"
import type { Category, Transaction } from "@/lib/firebase/firestore"
import type {
  BudgetPace,
  CategorySlice,
  SpendingAnomaly,
  SpendingAverages,
} from "@/lib/analytics"
import { indexCategories, resolveCategory } from "@/lib/analytics"
import { getCategoryIcon } from "@/lib/category-icons"
import { formatCurrency } from "@/lib/formatCurrency"
import { type PeriodType, fromDateKey } from "@/lib/periods"
import { cn } from "@/lib/utils"

const periodNoun: Record<PeriodType, string> = {
  day: "days",
  week: "weeks",
  month: "months",
  year: "years",
  custom: "periods",
}

function EmptyState({ icon: Icon, message }: { icon: typeof Receipt; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Icon className="h-10 w-10 text-muted-foreground/50 mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

function CategoryBadge({ icon, color, name }: { icon: string; color: string; name: string }) {
  const Icon = getCategoryIcon(icon)
  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      <span className="p-1.5 rounded-lg shrink-0" style={{ backgroundColor: `${color}20` }}>
        <Icon className="h-3.5 w-3.5" style={{ color }} />
      </span>
      <span className="truncate">{name}</span>
    </span>
  )
}

// ---------- Category breakdown ----------

export function CategoryBreakdownCard({
  slices,
  total,
  categoryHref,
}: {
  slices: CategorySlice[]
  total: number
  categoryHref: (categoryId: string) => string
}) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Spending by Category</CardTitle>
        <CardDescription>Where your money went this period</CardDescription>
      </CardHeader>
      <CardContent>
        {slices.length === 0 ? (
          <EmptyState icon={PieChartIcon} message="No expenses in this period." />
        ) : (
          <div className="space-y-4">
            <div className="relative h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={slices.length > 1 ? 2 : 0}
                    stroke="none"
                  >
                    {slices.map((slice) => (
                      <Cell key={slice.id} fill={slice.color} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltipProps} formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xs text-muted-foreground">Total spent</p>
                <p className="text-base font-bold">{formatCurrency(total)}</p>
              </div>
            </div>

            <ul className="space-y-1">
              {slices.map((slice) => (
                <li key={slice.id}>
                  <Link
                    href={categoryHref(slice.id)}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <CategoryBadge icon={slice.icon} color={slice.color} name={slice.name} />
                        <span className="font-semibold whitespace-nowrap">{formatCurrency(slice.amount)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${slice.share}%`, backgroundColor: slice.color }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {slice.share.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------- Budget vs actual ----------

const paceStyles = {
  over: { bar: "bg-red-500", text: "text-red-500" },
  "projected-over": { bar: "bg-amber-500", text: "text-amber-500" },
  warning: { bar: "bg-amber-500", text: "text-amber-500" },
  good: { bar: "bg-emerald-500", text: "text-emerald-500" },
}

function paceMessage(pace: BudgetPace) {
  switch (pace.status) {
    case "over":
      return `Over by ${formatCurrency(pace.spent - pace.budget)}`
    case "projected-over":
      return `On pace for ${formatCurrency(pace.projected!)} by month end`
    case "warning":
      return `${Math.round(pace.percentUsed)}% used · ${formatCurrency(pace.budget - pace.spent)} left`
    case "good":
      return `On track · ${formatCurrency(pace.budget - pace.spent)} left`
  }
}

export function BudgetPaceCard({
  paces,
  isMonthView,
  monthLabel,
  onSwitchToMonth,
}: {
  paces: BudgetPace[]
  isMonthView: boolean
  monthLabel: string
  onSwitchToMonth: () => void
}) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Budget vs Actual</CardTitle>
        <CardDescription>
          {isMonthView ? `Budgets for ${monthLabel}` : "Budgets are set per month"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isMonthView ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Target className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground mb-3">Switch to the Month view to compare against budgets.</p>
            <Button variant="outline" size="sm" onClick={onSwitchToMonth}>
              View by Month
            </Button>
          </div>
        ) : paces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Target className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No budgets set for {monthLabel}.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/categories">Set budgets</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {paces.map((pace) => {
              const style = paceStyles[pace.status]
              return (
                <li key={pace.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <CategoryBadge icon={pace.icon} color={pace.color} name={pace.name} />
                    <span className="text-muted-foreground whitespace-nowrap">
                      <span className="font-semibold text-foreground">{formatCurrency(pace.spent)}</span> /{" "}
                      {formatCurrency(pace.budget)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", style.bar)}
                      style={{ width: `${Math.min(pace.percentUsed, 100)}%` }}
                    />
                  </div>
                  <p className={cn("text-xs font-medium", style.text)}>{paceMessage(pace)}</p>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

// ---------- Unusual spending ----------

export function UnusualSpendingCard({
  anomalies,
  period,
  categoryHref,
}: {
  anomalies: SpendingAnomaly[]
  period: PeriodType
  categoryHref: (categoryId: string) => string
}) {
  const noun = periodNoun[period]
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Unusual Spending</CardTitle>
        <CardDescription>Categories at least 1.5× their average over the previous 3 {noun}</CardDescription>
      </CardHeader>
      <CardContent>
        {anomalies.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 p-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Nothing unusual. Spending is in line with your last 3 {noun}.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {anomalies.map((a) => (
              <li key={a.id}>
                <Link
                  href={categoryHref(a.id)}
                  className="flex items-start gap-3 rounded-lg bg-amber-500/10 p-3 hover:bg-amber-500/15 transition-colors"
                >
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="min-w-0 text-sm">
                    <p className="font-medium">
                      {a.name}: {formatCurrency(a.current)}{" "}
                      <span className="text-amber-500">({a.ratio.toFixed(1)}× usual)</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Average over the previous 3 {noun}: {formatCurrency(a.average)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

// ---------- Averages ----------

export function AveragesCard({ averages, expenseCount }: { averages: SpendingAverages; expenseCount: number }) {
  const tiles = [
    {
      label: "Avg daily spend",
      value: formatCurrency(averages.avgDaily),
      hint: averages.daysCounted > 0 ? `over ${averages.daysCounted} day${averages.daysCounted !== 1 ? "s" : ""}` : "no days yet",
    },
    {
      label: "Avg transaction",
      value: formatCurrency(averages.avgTransaction),
      hint: `${expenseCount} expense${expenseCount !== 1 ? "s" : ""}`,
    },
    {
      label: "Busiest day",
      value: averages.busiestWeekday?.name ?? "—",
      hint: averages.busiestWeekday ? formatCurrency(averages.busiestWeekday.amount) : "needs a week or more",
    },
  ]

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Spending Habits</CardTitle>
        <CardDescription>Averages for this period</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {tiles.map((tile) => (
            <div key={tile.label} className="bg-muted/50 rounded-lg p-3 text-center min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{tile.label}</p>
              <p className="text-base font-bold mt-1 truncate">{tile.value}</p>
              <p className="text-xs text-muted-foreground">{tile.hint}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ---------- Largest transactions ----------

export function TopTransactionsCard({ transactions, categories }: { transactions: Transaction[]; categories: Category[] }) {
  const categoriesById = indexCategories(categories)
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Largest Expenses</CardTitle>
        <CardDescription>Biggest single expenses this period</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <EmptyState icon={Receipt} message="No expenses in this period." />
        ) : (
          <ul className="divide-y divide-border">
            {transactions.map((tx, index) => {
              const category = resolveCategory(tx.categoryId, tx.categoryName, categoriesById)
              return (
                <li key={tx.id} className="flex items-center gap-3 py-2.5">
                  <span className="w-5 text-xs font-semibold text-muted-foreground">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <CalendarDays className="h-3 w-3 shrink-0" />
                      {tx.date ? format(fromDateKey(tx.date), "d MMM") : "—"} · {category.name}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-red-500 whitespace-nowrap">
                    -{formatCurrency(Number(tx.amount) || 0)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
