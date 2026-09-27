import { differenceInCalendarDays, endOfMonth, format, getDaysInMonth, subMonths } from "date-fns"
import type { Transaction } from "@/lib/firebase/firestore"
import type { InvestmentAccount, InvestmentType } from "@/lib/firebase/investments"
import { fromDateKey, monthKeyOf } from "@/lib/periods"

export const INVESTMENT_TYPES: { value: InvestmentType; label: string }[] = [
  { value: "money_market", label: "Money Market Fund" },
  { value: "mutual_fund", label: "Mutual Fund" },
  { value: "stock", label: "Stocks" },
  { value: "crypto", label: "Crypto" },
  { value: "fixed_income", label: "Fixed Income / Bonds" },
  { value: "savings", label: "Savings Plan" },
  { value: "real_estate", label: "Real Estate" },
  { value: "other", label: "Other" },
]

export const investmentTypeLabel = (type: InvestmentType) =>
  INVESTMENT_TYPES.find((t) => t.value === type)?.label ?? "Other"

// Maps card types onto the older Transaction.assetType values
export const legacyAssetType = (type: InvestmentType): NonNullable<Transaction["assetType"]> => {
  if (type === "money_market" || type === "mutual_fund") return "mutual_fund"
  if (type === "stock" || type === "crypto" || type === "fixed_income") return type
  return "other"
}

export const INVESTMENT_COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#84cc16",
]

const amountOf = (t: Transaction) => Number(t.amount) || 0
const monthOf = (t: Transaction) => (t.date || "").slice(0, 7)
const latestDate = (txs: Transaction[]) =>
  txs.reduce<string | null>((latest, t) => (t.date && (!latest || t.date > latest) ? t.date : latest), null)

export const investmentTransactions = (transactions: Transaction[]) =>
  transactions.filter((t) => t.type === "investment")

// ---------- Per-card summaries ----------

export interface TokenSummary {
  id: string
  symbol: string
  name?: string | null
  invested: number
  units: number
  count: number
  averagePrice: number | null
  lastDate: string | null
}

export interface AccountSummary {
  account: InvestmentAccount
  invested: number
  count: number
  thisMonth: number
  lastDate: string | null
  currentValue: number | null
  gain: number | null
  gainPct: number | null
  share: number
  tokens: TokenSummary[]
  // Crypto contributions not tied to a specific token
  untokenedInvested: number
  transactions: Transaction[]
}

export interface PortfolioSummary {
  accounts: AccountSummary[]
  totalInvested: number
  // Market value where known, amount invested otherwise
  estimatedValue: number
  valuedAccounts: number
  gain: number | null
  gainPct: number | null
  thisMonth: number
  lastMonth: number
  unassigned: Transaction[]
  unassignedTotal: number
}

export function summarizePortfolio(
  accounts: InvestmentAccount[],
  transactions: Transaction[],
  today: Date = new Date(),
): PortfolioSummary {
  const investments = investmentTransactions(transactions)
  const monthKey = monthKeyOf(today)
  const lastMonthKey = monthKeyOf(subMonths(today, 1))
  const accountIds = new Set(accounts.map((a) => a.id))

  const byAccount = new Map<string, Transaction[]>()
  const unassigned: Transaction[] = []
  investments.forEach((t) => {
    if (t.investmentAccountId && accountIds.has(t.investmentAccountId)) {
      const list = byAccount.get(t.investmentAccountId) ?? []
      list.push(t)
      byAccount.set(t.investmentAccountId, list)
    } else {
      unassigned.push(t)
    }
  })

  const totalInvested = investments.reduce((s, t) => s + amountOf(t), 0)

  const summaries: AccountSummary[] = accounts.map((account) => {
    const txs = byAccount.get(account.id) ?? []
    const invested = txs.reduce((s, t) => s + amountOf(t), 0)
    const hasValue = typeof account.currentValue === "number"
    const gain = hasValue ? account.currentValue! - invested : null

    const tokens = Object.values(account.tokens || {})
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((token) => {
        const tokenTxs = txs.filter((t) => t.investmentTokenId === token.id)
        const tokenInvested = tokenTxs.reduce((s, t) => s + amountOf(t), 0)
        const units = tokenTxs.reduce((s, t) => s + (Number(t.units) || 0), 0)
        return {
          id: token.id,
          symbol: token.symbol,
          name: token.name,
          invested: tokenInvested,
          units,
          count: tokenTxs.length,
          averagePrice: units > 0 ? tokenInvested / units : null,
          lastDate: latestDate(tokenTxs),
        }
      })
    const tokenIds = new Set(tokens.map((t) => t.id))

    return {
      account,
      invested,
      count: txs.length,
      thisMonth: txs.filter((t) => monthOf(t) === monthKey).reduce((s, t) => s + amountOf(t), 0),
      lastDate: latestDate(txs),
      currentValue: hasValue ? account.currentValue! : null,
      gain,
      gainPct: gain !== null && invested > 0 ? (gain / invested) * 100 : null,
      share: totalInvested > 0 ? (invested / totalInvested) * 100 : 0,
      tokens,
      untokenedInvested: txs
        .filter((t) => !t.investmentTokenId || !tokenIds.has(t.investmentTokenId))
        .reduce((s, t) => s + amountOf(t), 0),
      transactions: txs,
    }
  })

  const valued = summaries.filter((s) => s.currentValue !== null)
  const valuedInvested = valued.reduce((s, a) => s + a.invested, 0)
  const valuedGain = valued.reduce((s, a) => s + (a.gain ?? 0), 0)
  const unassignedTotal = unassigned.reduce((s, t) => s + amountOf(t), 0)

  return {
    accounts: summaries,
    totalInvested,
    estimatedValue:
      summaries.reduce((s, a) => s + (a.currentValue ?? a.invested), 0) + unassignedTotal,
    valuedAccounts: valued.length,
    gain: valued.length > 0 ? valuedGain : null,
    gainPct: valued.length > 0 && valuedInvested > 0 ? (valuedGain / valuedInvested) * 100 : null,
    thisMonth: investments.filter((t) => monthOf(t) === monthKey).reduce((s, t) => s + amountOf(t), 0),
    lastMonth: investments.filter((t) => monthOf(t) === lastMonthKey).reduce((s, t) => s + amountOf(t), 0),
    unassigned,
    unassignedTotal,
  }
}

// ---------- Monthly target ----------

// The target for a month is the most recent entry set on or before that month
export function targetForMonth(targets: Record<string, number>, monthKey: string): number | null {
  const keys = Object.keys(targets)
    .filter((k) => k <= monthKey)
    .sort()
  return keys.length ? targets[keys[keys.length - 1]] : null
}

export interface MonthContribution {
  monthKey: string
  label: string
  invested: number
  target: number | null
  met: boolean
}

export function monthlyContributions(
  transactions: Transaction[],
  targets: Record<string, number>,
  months = 12,
  today: Date = new Date(),
): MonthContribution[] {
  const investments = investmentTransactions(transactions)
  return Array.from({ length: months }, (_, i) => {
    const month = subMonths(today, months - 1 - i)
    const monthKey = monthKeyOf(month)
    const invested = investments.filter((t) => monthOf(t) === monthKey).reduce((s, t) => s + amountOf(t), 0)
    const target = targetForMonth(targets, monthKey)
    return {
      monthKey,
      label: format(month, months > 6 ? "MMM" : "MMM yy"),
      invested,
      target,
      met: target !== null && target > 0 && invested >= target,
    }
  })
}

export type TargetStatus = "met" | "on-track" | "behind" | "no-target"

export interface TargetProgress {
  monthKey: string
  monthLabel: string
  target: number | null
  invested: number
  remaining: number
  percent: number
  daysLeft: number
  perDayNeeded: number
  perWeekNeeded: number
  expectedByNow: number
  status: TargetStatus
  streak: number
  yearInvested: number
  yearTarget: number
  monthsMetThisYear: number
  monthsWithTargetThisYear: number
}

export function targetProgress(
  transactions: Transaction[],
  targets: Record<string, number>,
  today: Date = new Date(),
): TargetProgress {
  const monthKey = monthKeyOf(today)
  const history = monthlyContributions(transactions, targets, 24, today)
  const current = history[history.length - 1]
  const target = current.target
  const invested = current.invested

  // Days left including today
  const daysLeft = differenceInCalendarDays(endOfMonth(today), today) + 1
  const remaining = target !== null ? Math.max(target - invested, 0) : 0
  const expectedByNow = target !== null ? (target * today.getDate()) / getDaysInMonth(today) : 0

  let status: TargetStatus = "no-target"
  if (target !== null && target > 0) {
    if (invested >= target) status = "met"
    else if (invested >= expectedByNow) status = "on-track"
    else status = "behind"
  }

  // Consecutive months (ending last month, plus this month if already met) that hit their target
  let streak = current.met ? 1 : 0
  for (let i = history.length - 2; i >= 0; i--) {
    if (!history[i].met) break
    streak++
  }

  const year = monthKey.slice(0, 4)
  const thisYear = history.filter((m) => m.monthKey.startsWith(year))

  return {
    monthKey,
    monthLabel: format(today, "MMMM yyyy"),
    target,
    invested,
    remaining,
    percent: target ? (invested / target) * 100 : 0,
    daysLeft,
    perDayNeeded: daysLeft > 0 ? remaining / daysLeft : remaining,
    perWeekNeeded: daysLeft > 0 ? (remaining / daysLeft) * 7 : remaining,
    expectedByNow,
    status,
    streak,
    yearInvested: thisYear.reduce((s, m) => s + m.invested, 0),
    yearTarget: thisYear.reduce((s, m) => s + (m.target ?? 0), 0),
    monthsMetThisYear: thisYear.filter((m) => m.met).length,
    monthsWithTargetThisYear: thisYear.filter((m) => (m.target ?? 0) > 0).length,
  }
}

export const formatInvestmentDate = (dateKey: string | null) =>
  dateKey ? format(fromDateKey(dateKey), "d MMM yyyy") : "—"
