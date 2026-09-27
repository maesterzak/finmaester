"use client"

import { useMemo } from "react"
import { BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import type { Transaction } from "@/lib/firebase/firestore"
import { buildTimeSeries } from "@/lib/analytics"
import type { DateRange, PeriodType } from "@/lib/periods"
import { formatCurrency, formatCurrencyCompact } from "@/lib/formatCurrency"
import { EXPENSE_COLOR, INCOME_COLOR, chartAxisProps, chartGridProps, chartTooltipProps } from "./chart-theme"

interface SpendingChartProps {
  transactions: Transaction[]
  period: PeriodType
  range: DateRange
  label: string
}

export function SpendingChart({ transactions, period, range, label }: SpendingChartProps) {
  const data = useMemo(() => buildTimeSeries(transactions, period, range), [transactions, period, range])
  const hasData = data.some((b) => b.income > 0 || b.expense > 0)

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Income vs Expenses</CardTitle>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        {period === "day" || !hasData ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              {period === "day" ? "Switch to Week, Month or Year to see a trend." : "No income or expenses in this period."}
            </p>
          </div>
        ) : (
          <div className="h-[220px] sm:h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid {...chartGridProps} />
                <XAxis dataKey="label" {...chartAxisProps} minTickGap={8} />
                <YAxis {...chartAxisProps} width={56} tickFormatter={(v: number) => formatCurrencyCompact(v)} />
                <Tooltip {...chartTooltipProps} formatter={(value: number) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="income" name="Income" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="expense" name="Expenses" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
