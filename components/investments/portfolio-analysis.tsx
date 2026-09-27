"use client"

import { useMemo } from "react"
import { AlertTriangle, BarChart3, Lightbulb, PieChart as PieChartIcon } from "lucide-react"
import { Bar, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { chartAxisProps, chartGridProps, chartTooltipProps } from "@/components/analytics/chart-theme"
import { type MonthContribution, type PortfolioSummary, investmentTypeLabel } from "@/lib/investments"
import { formatCurrency, formatCurrencyCompact } from "@/lib/formatCurrency"
import { cn } from "@/lib/utils"

const UNASSIGNED_COLOR = "hsl(0, 0%, 55%)"

// ---------- Headline tiles ----------

export function PortfolioOverview({ portfolio }: { portfolio: PortfolioSummary }) {
  const monthChange =
    portfolio.lastMonth > 0 ? ((portfolio.thisMonth - portfolio.lastMonth) / portfolio.lastMonth) * 100 : null

  const tiles = [
    { label: "Total invested", value: formatCurrency(portfolio.totalInvested), hint: `${portfolio.accounts.length} card${portfolio.accounts.length !== 1 ? "s" : ""}` },
    {
      label: "Portfolio value",
      value: formatCurrency(portfolio.estimatedValue),
      hint:
        portfolio.valuedAccounts === 0
          ? "add current values to track"
          : portfolio.valuedAccounts < portfolio.accounts.length
            ? `${portfolio.valuedAccounts} of ${portfolio.accounts.length} cards valued`
            : "all cards valued",
    },
    {
      label: "Gain / loss",
      value:
        portfolio.gain === null
          ? "—"
          : `${portfolio.gain >= 0 ? "+" : "-"}${formatCurrency(Math.abs(portfolio.gain))}`,
      valueClass: portfolio.gain === null ? undefined : portfolio.gain >= 0 ? "text-emerald-500" : "text-red-500",
      hint: portfolio.gainPct === null ? "on valued cards" : `${portfolio.gainPct >= 0 ? "+" : ""}${portfolio.gainPct.toFixed(1)}% on valued cards`,
    },
    {
      label: "This month",
      value: formatCurrency(portfolio.thisMonth),
      hint:
        monthChange === null
          ? `last month ${formatCurrency(portfolio.lastMonth)}`
          : `${monthChange >= 0 ? "▲" : "▼"} ${Math.abs(monthChange).toFixed(0)}% vs last month`,
    },
  ]

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="min-w-0">
            <p className="text-sm text-muted-foreground">{tile.label}</p>
            <p className={cn("text-lg sm:text-xl font-bold truncate", tile.valueClass)}>{tile.value}</p>
            <p className="text-xs text-muted-foreground truncate">{tile.hint}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ---------- Contributions vs target ----------

export function ContributionsChart({ months }: { months: MonthContribution[] }) {
  const hasData = months.some((m) => m.invested > 0 || (m.target ?? 0) > 0)
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Monthly Contributions</CardTitle>
        <CardDescription>Last 12 months against your target</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No investments recorded yet.</p>
          </div>
        ) : (
          <div className="h-[240px] sm:h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={months} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid {...chartGridProps} />
                <XAxis dataKey="label" {...chartAxisProps} minTickGap={4} />
                <YAxis {...chartAxisProps} width={56} tickFormatter={(v: number) => formatCurrencyCompact(v)} />
                <Tooltip
                  {...chartTooltipProps}
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="invested" name="Invested" radius={[4, 4, 0, 0]} maxBarSize={28}>
                  {months.map((m) => (
                    <Cell key={m.monthKey} fill={m.met ? "hsl(156, 100%, 40%)" : "hsl(217, 91%, 60%)"} />
                  ))}
                </Bar>
                <Line
                  type="stepAfter"
                  dataKey="target"
                  name="Target"
                  stroke="hsl(38, 92%, 50%)"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
        {hasData && (
          <p className="text-xs text-muted-foreground mt-2">Green bars are months where you met your target.</p>
        )}
      </CardContent>
    </Card>
  )
}

// ---------- Allocation ----------

export function AllocationCard({ portfolio }: { portfolio: PortfolioSummary }) {
  const slices = useMemo(() => {
    const list = portfolio.accounts
      .filter((a) => a.invested > 0)
      .map((a) => ({ id: a.account.id, name: a.account.name, color: a.account.color, amount: a.invested, type: a.account.type }))
    if (portfolio.unassignedTotal > 0) {
      list.push({ id: "unassigned", name: "Unassigned", color: UNASSIGNED_COLOR, amount: portfolio.unassignedTotal, type: "other" })
    }
    return list.sort((a, b) => b.amount - a.amount)
  }, [portfolio])

  const byType = useMemo(() => {
    const totals = new Map<string, number>()
    portfolio.accounts.forEach((a) => {
      if (a.invested > 0) {
        const label = investmentTypeLabel(a.account.type)
        totals.set(label, (totals.get(label) || 0) + a.invested)
      }
    })
    return [...totals.entries()].sort((a, b) => b[1] - a[1])
  }, [portfolio])

  const total = portfolio.totalInvested

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Allocation</CardTitle>
        <CardDescription>How your money is spread</CardDescription>
      </CardHeader>
      <CardContent>
        {slices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <PieChartIcon className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">Nothing invested yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-[180px_1fr] items-center">
            <div className="relative h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
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
                <p className="text-[10px] text-muted-foreground">Invested</p>
                <p className="text-sm font-bold">{formatCurrencyCompact(total)}</p>
              </div>
            </div>
            <div className="space-y-3 min-w-0">
              <ul className="space-y-2">
                {slices.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="truncate">{s.name}</span>
                    </span>
                    <span className="whitespace-nowrap">
                      <span className="font-semibold">{formatCurrency(s.amount)}</span>
                      <span className="text-muted-foreground text-xs"> · {total > 0 ? ((s.amount / total) * 100).toFixed(0) : 0}%</span>
                    </span>
                  </li>
                ))}
              </ul>
              {byType.length > 1 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {byType.map(([label, amount]) => (
                    <span key={label} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                      {label} {total > 0 ? ((amount / total) * 100).toFixed(0) : 0}%
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------- Insights ----------

export function InvestmentInsights({
  portfolio,
  months,
}: {
  portfolio: PortfolioSummary
  months: MonthContribution[]
}) {
  const insights = useMemo(() => {
    const list: { tone: "info" | "warn"; text: string }[] = []
    const completed = months.slice(0, -1) // exclude the current, unfinished month
    const recent = completed.slice(-6)
    const active = recent.filter((m) => m.invested > 0)

    if (recent.length > 0) {
      const avg = recent.reduce((s, m) => s + m.invested, 0) / recent.length
      list.push({ tone: "info", text: `You've invested an average of ${formatCurrency(avg)} a month over the last ${recent.length} months.` })
    }

    const best = [...completed].sort((a, b) => b.invested - a.invested)[0]
    if (best && best.invested > 0) {
      list.push({ tone: "info", text: `Your best month was ${best.label} with ${formatCurrency(best.invested)}.` })
    }

    const withTarget = completed.filter((m) => (m.target ?? 0) > 0)
    if (withTarget.length > 0) {
      const met = withTarget.filter((m) => m.met).length
      list.push({
        tone: met === withTarget.length ? "info" : "warn",
        text: `You met your target in ${met} of the last ${withTarget.length} month${withTarget.length !== 1 ? "s" : ""} that had one.`,
      })
      const shortfall = withTarget.reduce((s, m) => s + Math.max((m.target ?? 0) - m.invested, 0), 0)
      if (shortfall > 0) {
        list.push({ tone: "warn", text: `Across those months you're ${formatCurrency(shortfall)} short of target in total.` })
      }
    }

    if (recent.length >= 3 && active.length < recent.length) {
      list.push({
        tone: "warn",
        text: `You skipped investing in ${recent.length - active.length} of the last ${recent.length} months. Investing right after payday helps keep the habit.`,
      })
    }

    const largest = [...portfolio.accounts].sort((a, b) => b.share - a.share)[0]
    if (largest && portfolio.accounts.length > 1 && largest.share >= 60) {
      list.push({
        tone: "warn",
        text: `${largest.account.name} holds ${largest.share.toFixed(0)}% of everything you've invested. Consider whether that concentration suits you.`,
      })
    }

    const losing = portfolio.accounts.filter((a) => a.gainPct !== null && a.gainPct < 0)
    losing.forEach((a) =>
      list.push({ tone: "warn", text: `${a.account.name} is down ${Math.abs(a.gainPct!).toFixed(1)}% on what you put in.` }),
    )

    const stale = portfolio.accounts.filter(
      (a) => a.currentValue !== null && a.account.currentValueDate && daysSince(a.account.currentValueDate) > 30,
    )
    if (stale.length > 0) {
      list.push({
        tone: "info",
        text: `Update the current value of ${stale.map((a) => a.account.name).join(", ")}. It's over a month old.`,
      })
    }

    return list
  }, [portfolio, months])

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Insights</CardTitle>
        <CardDescription>What your investing pattern shows</CardDescription>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Record a few investments to see insights here.</p>
        ) : (
          <ul className="space-y-2">
            {insights.map((insight, i) => (
              <li
                key={i}
                className={cn(
                  "flex items-start gap-2 rounded-lg p-3 text-sm",
                  insight.tone === "warn" ? "bg-amber-500/10" : "bg-muted/40",
                )}
              >
                {insight.tone === "warn" ? (
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                )}
                <span className="min-w-0 break-words">{insight.text}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

const daysSince = (dateKey: string) => (Date.now() - new Date(`${dateKey}T00:00:00`).getTime()) / 86_400_000
