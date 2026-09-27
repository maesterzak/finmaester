"use client"

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/formatCurrency"
import { type PeriodTotals, percentChange } from "@/lib/analytics"

interface PeriodSummaryProps {
  current: PeriodTotals
  previous: PeriodTotals
  previousLabel: string
}

export function PeriodSummary({ current, previous, previousLabel }: PeriodSummaryProps) {
  const tiles = [
    {
      label: "Income",
      value: formatCurrency(current.income),
      valueClass: "text-emerald-500",
      change: percentChange(current.income, previous.income),
      higherIsBetter: true,
    },
    {
      label: "Expenses",
      value: formatCurrency(current.expenses),
      valueClass: "text-red-500",
      change: percentChange(current.expenses, previous.expenses),
      higherIsBetter: false,
    },
    {
      label: "Net",
      value: `${current.net < 0 ? "-" : ""}${formatCurrency(Math.abs(current.net))}`,
      valueClass: current.net >= 0 ? "text-emerald-500" : "text-red-500",
      change: percentChange(current.net, previous.net),
      higherIsBetter: true,
    },
    {
      label: "Savings rate",
      value: current.savingsRate === null ? "—" : `${current.savingsRate.toFixed(0)}%`,
      valueClass: current.savingsRate !== null && current.savingsRate < 0 ? "text-red-500" : "text-foreground",
      // Percentage points rather than percent change
      change:
        current.savingsRate !== null && previous.savingsRate !== null
          ? current.savingsRate - previous.savingsRate
          : null,
      changeUnit: "pts",
      higherIsBetter: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="text-center sm:text-left min-w-0">
          <p className="text-sm text-muted-foreground">{tile.label}</p>
          <p className={cn("text-lg font-bold truncate", tile.valueClass)}>{tile.value}</p>
          <ChangeIndicator
            change={tile.change}
            unit={tile.changeUnit ?? "%"}
            higherIsBetter={tile.higherIsBetter}
            previousLabel={previousLabel}
          />
        </div>
      ))}
    </div>
  )
}

function ChangeIndicator({
  change,
  unit,
  higherIsBetter,
  previousLabel,
}: {
  change: number | null
  unit: string
  higherIsBetter: boolean
  previousLabel: string
}) {
  if (change === null) {
    return <p className="text-xs text-muted-foreground">No data {previousLabel}</p>
  }

  const rounded = Math.round(change)
  if (rounded === 0) {
    return (
      <p className="text-xs text-muted-foreground inline-flex items-center gap-0.5">
        <Minus className="h-3 w-3" /> Same as {previousLabel}
      </p>
    )
  }

  const isUp = rounded > 0
  const isGood = isUp === higherIsBetter
  const Icon = isUp ? ArrowUpRight : ArrowDownRight

  return (
    <p className={cn("text-xs inline-flex items-center gap-0.5", isGood ? "text-emerald-500" : "text-red-500")}>
      <Icon className="h-3 w-3" />
      {Math.abs(rounded)}
      {unit === "%" ? "%" : " pts"} vs {previousLabel}
    </p>
  )
}
