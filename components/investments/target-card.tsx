"use client"

import type React from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Flame, Pencil, Target, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { AccountSummary, TargetProgress } from "@/lib/investments"
import { formatCurrency } from "@/lib/formatCurrency"
import { cn } from "@/lib/utils"

const statusStyles = {
  met: { label: "Target met", className: "text-emerald-500 bg-emerald-500/10", bar: "bg-emerald-500", Icon: CheckCircle2 },
  "on-track": { label: "On track", className: "text-emerald-500 bg-emerald-500/10", bar: "bg-emerald-500", Icon: TrendingUp },
  behind: { label: "Behind pace", className: "text-amber-500 bg-amber-500/10", bar: "bg-amber-500", Icon: TrendingDown },
  "no-target": { label: "No target", className: "text-muted-foreground bg-muted", bar: "bg-primary", Icon: Target },
}

function ProgressBar({ percent, expectedPercent, barClass }: { percent: number; expectedPercent?: number; barClass: string }) {
  return (
    <div className="relative h-3 rounded-full bg-muted overflow-hidden">
      <div className={cn("h-full rounded-full transition-all", barClass)} style={{ width: `${Math.min(percent, 100)}%` }} />
      {expectedPercent !== undefined && expectedPercent > 0 && expectedPercent < 100 && (
        // Marks where you should be by today to finish the month on target
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground/60"
          style={{ left: `${expectedPercent}%` }}
          title="Where you should be by today"
        />
      )}
    </div>
  )
}

export function TargetCard({
  progress,
  accounts,
  onEditTarget,
  onInvest,
}: {
  progress: TargetProgress
  accounts: AccountSummary[]
  onEditTarget: () => void
  onInvest: () => void
}) {
  const style = statusStyles[progress.status]
  const planned = accounts.filter((a) => (a.account.monthlyAllocation ?? 0) > 0)
  const plannedTotal = planned.reduce((s, a) => s + (a.account.monthlyAllocation ?? 0), 0)

  if (progress.target === null) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 w-fit">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">Set a monthly investment target</p>
            <p className="text-sm text-muted-foreground">
              Track how much you invest each month and get a daily pace to hit it.
            </p>
          </div>
          <Button onClick={onEditTarget} className="w-full sm:w-auto">
            Set target
          </Button>
        </CardContent>
      </Card>
    )
  }

  const expectedPercent = progress.target ? (progress.expectedByNow / progress.target) * 100 : 0

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-lg">Monthly Target · {progress.monthLabel}</CardTitle>
            <CardDescription>Target {formatCurrency(progress.target)} per month</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onEditTarget} className="gap-1.5 shrink-0">
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit target</span>
            <span className="sm:hidden">Edit</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className="text-2xl sm:text-3xl font-bold">
              {formatCurrency(progress.invested)}
              <span className="text-sm sm:text-base font-normal text-muted-foreground">
                {" "}
                / {formatCurrency(progress.target)}
              </span>
            </p>
            <span
              className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", style.className)}
            >
              <style.Icon className="h-3.5 w-3.5" /> {style.label}
            </span>
          </div>
          <ProgressBar percent={progress.percent} expectedPercent={expectedPercent} barClass={style.bar} />
          <p className="text-xs text-muted-foreground">
            {Math.round(progress.percent)}% done
            {progress.status !== "met" && ` · by today you should be at ${formatCurrency(progress.expectedByNow)}`}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat
            label="Left to invest"
            value={progress.status === "met" ? "Done 🎉" : formatCurrency(progress.remaining)}
          />
          <Stat label="Days left" value={String(progress.daysLeft)} />
          <Stat
            label="Needed per week"
            value={progress.status === "met" ? "—" : formatCurrency(progress.perWeekNeeded)}
            hint={progress.status === "met" ? undefined : `${formatCurrency(progress.perDayNeeded)}/day`}
          />
          <Stat
            label="Streak"
            value={`${progress.streak} month${progress.streak !== 1 ? "s" : ""}`}
            icon={progress.streak > 0 ? <Flame className="h-3.5 w-3.5 text-orange-500" /> : undefined}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm rounded-lg bg-muted/40 p-3">
          <span className="text-muted-foreground">
            This year: <span className="font-semibold text-foreground">{formatCurrency(progress.yearInvested)}</span> of{" "}
            {formatCurrency(progress.yearTarget)}
          </span>
          <span className="text-muted-foreground">
            Target met {progress.monthsMetThisYear} of {progress.monthsWithTargetThisYear} month
            {progress.monthsWithTargetThisYear !== 1 ? "s" : ""}
          </span>
        </div>

        {planned.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">Monthly plan</p>
              {plannedTotal !== progress.target && (
                <p className="text-xs text-amber-500">
                  Plans add up to {formatCurrency(plannedTotal)} ({plannedTotal < progress.target ? "under" : "over"}{" "}
                  target by {formatCurrency(Math.abs(progress.target - plannedTotal))})
                </p>
              )}
            </div>
            <ul className="space-y-3">
              {planned.map((a) => {
                const plan = a.account.monthlyAllocation ?? 0
                const pct = plan > 0 ? (a.thisMonth / plan) * 100 : 0
                return (
                  <li key={a.account.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: a.account.color }} />
                        <span className="truncate">{a.account.name}</span>
                      </span>
                      <span className="whitespace-nowrap text-muted-foreground">
                        <span className="font-semibold text-foreground">{formatCurrency(a.thisMonth)}</span> /{" "}
                        {formatCurrency(plan)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: a.account.color }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {progress.status !== "met" && (
          <Button onClick={onInvest} className="w-full sm:w-auto">
            Record an investment
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function Stat({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-muted/50 rounded-lg p-2.5 sm:p-3 min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      <p className="text-sm sm:text-base font-semibold mt-0.5 truncate flex items-center gap-1">
        {icon}
        {value}
      </p>
      {hint && <p className="text-xs text-muted-foreground truncate">{hint}</p>}
    </div>
  )
}

// Compact version for the dashboard
export function TargetWidget({ progress }: { progress: TargetProgress }) {
  const style = statusStyles[progress.status]
  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Target className="h-5 w-5 text-primary shrink-0" />
            <p className="font-semibold truncate">Investment target</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 shrink-0">
            <Link href="/dashboard/investments">
              Details <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        {progress.target === null ? (
          <p className="text-sm text-muted-foreground">
            No target yet.{" "}
            <Link href="/dashboard/investments" className="text-primary hover:underline">
              Set a monthly target
            </Link>
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <p className="text-xl font-bold">
                {formatCurrency(progress.invested)}
                <span className="text-sm font-normal text-muted-foreground"> / {formatCurrency(progress.target)}</span>
              </p>
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", style.className)}>
                <style.Icon className="h-3 w-3" /> {style.label}
              </span>
            </div>
            <ProgressBar
              percent={progress.percent}
              expectedPercent={progress.target ? (progress.expectedByNow / progress.target) * 100 : 0}
              barClass={style.bar}
            />
            <p className="text-xs text-muted-foreground">
              {progress.status === "met"
                ? `Target met for ${progress.monthLabel}.`
                : `${formatCurrency(progress.remaining)} to go · ${progress.daysLeft} day${progress.daysLeft !== 1 ? "s" : ""} left · about ${formatCurrency(progress.perWeekNeeded)}/week`}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
