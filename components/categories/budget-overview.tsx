"use client"

import { useMemo } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { PiggyBank, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Category, Transaction } from "@/lib/firebase/firestore"
import { budgetPaces, onlyExpenses } from "@/lib/analytics"
import { formatCurrency } from "@/lib/formatCurrency"
import { fromDateKey, monthKeyOf } from "@/lib/periods"
import { cn } from "@/lib/utils"

interface BudgetOverviewProps {
  categories: Category[]
  transactions: Transaction[]
  // "yyyy-MM" — budgets are set per month
  monthKey: string
  // Hide the "Set budgets" link when already on the Categories page
  showManageLink?: boolean
}

// Total of every category budget for the month against what has been spent in those categories
export function BudgetOverview({ categories, transactions, monthKey, showManageLink = true }: BudgetOverviewProps) {
  const summary = useMemo(() => {
    const expenses = onlyExpenses(transactions)
    const paces = budgetPaces(categories, expenses, monthKey)
    const budget = paces.reduce((s, p) => s + p.budget, 0)
    const spent = paces.reduce((s, p) => s + p.spent, 0)
    const projectedValues = paces.map((p) => p.projected)
    const projected = projectedValues.every((p) => p !== null)
      ? projectedValues.reduce((s: number, p) => s + (p ?? 0), 0)
      : null
    const monthExpenses = expenses
      .filter((t) => t.date?.slice(0, 7) === monthKey)
      .reduce((s, t) => s + (Number(t.amount) || 0), 0)

    return {
      budget,
      spent,
      remaining: budget - spent,
      percent: budget > 0 ? (spent / budget) * 100 : 0,
      projected,
      categoryCount: paces.length,
      overCount: paces.filter((p) => p.status === "over").length,
      // Spending in categories that have no budget this month
      unbudgeted: Math.max(monthExpenses - spent, 0),
    }
  }, [categories, transactions, monthKey])

  const monthLabel = format(fromDateKey(`${monthKey}-01`), "MMMM yyyy")
  const isCurrentMonth = monthKey === monthKeyOf(new Date())

  if (summary.categoryCount === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <Target className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground flex-1">
            No category budgets set for {monthLabel}. Add budgets to see your total spent against what you planned.
          </p>
          {showManageLink && (
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
              <Link href="/dashboard/categories">Set budgets</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const over = summary.spent > summary.budget
  const tone = over
    ? { bar: "bg-red-500", text: "text-red-500", badge: "bg-red-500/10 text-red-500" }
    : summary.percent >= 75
      ? { bar: "bg-amber-500", text: "text-amber-500", badge: "bg-amber-500/10 text-amber-500" }
      : { bar: "bg-emerald-500", text: "text-emerald-500", badge: "bg-emerald-500/10 text-emerald-500" }

  // Where spending "should" be by today if spread evenly over the month
  const expectedPercent =
    isCurrentMonth && summary.budget > 0
      ? (new Date().getDate() / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()) * 100
      : null

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <PiggyBank className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold">Budget overview</p>
              <p className="text-xs text-muted-foreground">
                {monthLabel} · {summary.categoryCount} budgeted categor{summary.categoryCount !== 1 ? "ies" : "y"}
              </p>
            </div>
          </div>
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", tone.badge)}>
            {Math.round(summary.percent)}% used
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-2xl sm:text-3xl font-bold">
            <span className={cn(over && "text-red-500")}>{formatCurrency(summary.spent)}</span>
            <span className="text-sm sm:text-base font-normal text-muted-foreground">
              {" "}
              / {formatCurrency(summary.budget)}
            </span>
          </p>
          <div className="relative h-3 rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", tone.bar)}
              style={{ width: `${Math.min(summary.percent, 100)}%` }}
            />
            {expectedPercent !== null && expectedPercent < 100 && (
              <div
                className="absolute top-0 h-full w-0.5 bg-foreground/60"
                style={{ left: `${expectedPercent}%` }}
                title="Where you'd be today if spending evenly"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat
            label={over ? "Over budget" : "Left to spend"}
            value={formatCurrency(Math.abs(summary.remaining))}
            className={over ? "text-red-500" : "text-emerald-500"}
          />
          <Stat label="Spent" value={`${summary.percent.toFixed(1)}%`} className={tone.text} />
          <Stat
            label={isCurrentMonth ? "Projected by month end" : "Final spend"}
            value={summary.projected === null ? "—" : formatCurrency(summary.projected)}
            className={summary.projected !== null && summary.projected > summary.budget ? "text-amber-500" : undefined}
          />
          <Stat
            label="Over-budget categories"
            value={`${summary.overCount} of ${summary.categoryCount}`}
            className={summary.overCount > 0 ? "text-red-500" : undefined}
          />
        </div>

        {summary.unbudgeted > 0 && (
          <p className="text-xs text-muted-foreground">
            Plus {formatCurrency(summary.unbudgeted)} spent in categories without a budget this month.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-2.5 sm:p-3 min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium truncate">{label}</p>
      <p className={cn("text-sm sm:text-base font-semibold mt-0.5 truncate", className)}>{value}</p>
    </div>
  )
}
