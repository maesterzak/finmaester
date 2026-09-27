"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PeriodSummary } from "@/components/analytics/period-summary"
import { useTransactions } from "@/hooks/useTransactions"
import { filterByRange, summarize } from "@/lib/analytics"
import { formatCurrency } from "@/lib/formatCurrency"
import {
  type PeriodType,
  formatPeriodLabel,
  getPeriodRange,
  getPreviousRange,
  previousPeriodLabel,
} from "@/lib/periods"

type SummaryPeriod = Exclude<PeriodType, "custom">

const PERIODS: { value: SummaryPeriod; label: string }[] = [
  { value: "day", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
]

// Uses the same Sunday-start periods as the Transactions and Analytics pages
export function FinanceSummary() {
  const { transactions, loading } = useTransactions()
  const [period, setPeriod] = useState<SummaryPeriod>("month")

  const { range, current, previous } = useMemo(() => {
    const range = getPeriodRange(period, new Date())
    return {
      range,
      current: summarize(filterByRange(transactions, range)),
      previous: summarize(filterByRange(transactions, getPreviousRange(period, range))),
    }
  }, [transactions, period])

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-xl">Financial Summary</CardTitle>
            <CardDescription>{formatPeriodLabel(period, range)}</CardDescription>
          </div>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as SummaryPeriod)}>
            <TabsList className="grid w-full grid-cols-4 xl:w-auto">
              {PERIODS.map((p) => (
                <TabsTrigger key={p.value} value={p.value} className="text-xs sm:text-sm px-1.5 sm:px-3">
                  {p.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <PeriodSummary current={current} previous={previous} previousLabel={previousPeriodLabel[period]} />
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
          <p className="text-sm text-muted-foreground">
            Invested: <span className="font-semibold text-blue-500">{formatCurrency(current.invested)}</span>
          </p>
          <Button asChild variant="ghost" size="sm" className="gap-1 -mr-2">
            <Link href={`/dashboard/transactions?period=${period}`}>
              See transactions <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
