"use client"

import { useMemo } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { AlertTriangle, ArrowRight, CheckCircle2, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Category, Transaction } from "@/lib/firebase/firestore"
import { budgetPaces, onlyExpenses } from "@/lib/analytics"
import { getCategoryIcon } from "@/lib/category-icons"
import { formatCurrency } from "@/lib/formatCurrency"
import { monthKeyOf } from "@/lib/periods"
import { cn } from "@/lib/utils"

const statusStyle = {
  over: { bar: "bg-red-500", text: "text-red-500", label: (spent: number, budget: number) => `Over by ${formatCurrency(spent - budget)}` },
  "projected-over": { bar: "bg-amber-500", text: "text-amber-500", label: () => "On pace to overspend" },
  warning: { bar: "bg-amber-500", text: "text-amber-500", label: (spent: number, budget: number) => `${formatCurrency(budget - spent)} left` },
  good: { bar: "bg-emerald-500", text: "text-emerald-500", label: () => "" },
}

// This month's budgets (the ones set on the Categories page), with a month-end projection
export function BudgetAlerts({ categories, transactions }: { categories: Category[]; transactions: Transaction[] }) {
  const monthKey = monthKeyOf(new Date())
  const paces = useMemo(
    () => budgetPaces(categories, onlyExpenses(transactions), monthKey),
    [categories, transactions, monthKey],
  )
  const alerts = paces.filter((p) => p.status !== "good")
  const monthName = format(new Date(), "MMMM")

  if (paces.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <Target className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground flex-1">
            No budgets set for {monthName}. Budgets warn you before you overspend.
          </p>
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href="/dashboard/categories">Set budgets</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (alerts.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          <p className="text-sm">
            All {paces.length} budget{paces.length !== 1 ? "s" : ""} for {monthName} are on track.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-amber-500/30">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {alerts.length} budget{alerts.length !== 1 ? "s" : ""} need attention
          </p>
          <Button asChild variant="ghost" size="sm" className="gap-1 shrink-0">
            <Link href="/dashboard/categories">
              Budgets <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {alerts.slice(0, 4).map((pace, index) => {
            const style = statusStyle[pace.status]
            const Icon = getCategoryIcon(pace.icon)
            return (
              // Phones show the two most urgent to keep the dashboard short
              <li key={pace.id} className={cn("rounded-lg bg-muted/40 p-3 space-y-2", index >= 2 && "hidden sm:block")}>
                <div className="text-sm min-w-0">
                  <p className="flex items-center gap-2 font-medium min-w-0">
                    <Icon className="h-4 w-4 shrink-0" style={{ color: pace.color }} />
                    <span className="truncate">{pace.name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatCurrency(pace.spent)} of {formatCurrency(pace.budget)}
                  </p>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", style.bar)}
                    style={{ width: `${Math.min(pace.percentUsed, 100)}%` }}
                  />
                </div>
                <p className={cn("text-xs font-medium", style.text)}>{style.label(pace.spent, pace.budget)}</p>
              </li>
            )
          })}
        </ul>
        {alerts.length > 2 && (
          <p className="text-xs text-muted-foreground">
            <span className="sm:hidden">and {alerts.length - 2} more · </span>
            {alerts.length > 4 && <span className="hidden sm:inline">and {alerts.length - 4} more · </span>}
            <a href="/dashboard/categories" className="text-primary hover:underline">
              see all budgets
            </a>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
