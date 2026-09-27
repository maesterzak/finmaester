"use client"

import type React from "react"
import { Suspense, useMemo } from "react"
import { format } from "date-fns"
import { Download, FileText, Printer, Share2 } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PeriodFilter } from "@/components/transactions/period-filter"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTransactions } from "@/hooks/useTransactions"
import { useCategories } from "@/hooks/useCategories"
import { useInvestments } from "@/hooks/useInvestments"
import { usePeriodFilter } from "@/hooks/usePeriodFilter"
import type { Transaction } from "@/lib/firebase/firestore"
import {
  budgetPaces,
  categoryBreakdown,
  filterByRange,
  indexCategories,
  onlyExpenses,
  resolveCategory,
  summarize,
  topTransactions,
} from "@/lib/analytics"
import { formatCurrency, getActiveCurrency } from "@/lib/formatCurrency"
import { fromDateKey } from "@/lib/periods"
import { toastError, toastSuccess } from "@/lib/toast"
import { cn } from "@/lib/utils"

export default function ReportsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="print:hidden">
        <DashboardHeader title="Reports" description="A summary of any period to print, save or share" />
      </div>
      {/* Filters are read from the URL (useSearchParams), which needs a Suspense boundary */}
      <Suspense>
        <ReportContent />
      </Suspense>
    </div>
  )
}

const csvCell = (value: unknown) => {
  const text = value === undefined || value === null ? "" : String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function ReportContent() {
  const { transactions, loading: txLoading } = useTransactions()
  const { categories, loading: catLoading } = useCategories()
  const { accounts, loading: invLoading } = useInvestments()
  const filter = usePeriodFilter()
  const { period, range, label } = filter
  const loading = txLoading || catLoading || invLoading

  const report = useMemo(() => {
    const inPeriod = filterByRange(transactions, range)
    const expenses = onlyExpenses(inPeriod)
    const categoriesById = indexCategories(categories)
    const accountNames = new Map(accounts.map((a) => [a.id, a.name]))

    const investedByCard = new Map<string, number>()
    inPeriod
      .filter((t) => t.type === "investment")
      .forEach((t) => {
        const name = (t.investmentAccountId && accountNames.get(t.investmentAccountId)) || t.assetName || "Unassigned"
        investedByCard.set(name, (investedByCard.get(name) || 0) + (Number(t.amount) || 0))
      })

    return {
      inPeriod: [...inPeriod].sort((a, b) => (a.date || "").localeCompare(b.date || "")),
      totals: summarize(inPeriod),
      breakdown: categoryBreakdown(expenses, categories),
      largest: topTransactions(expenses, 5),
      budgets: period === "month" ? budgetPaces(categories, onlyExpenses(transactions), range.start.slice(0, 7)) : [],
      investments: [...investedByCard.entries()].sort((a, b) => b[1] - a[1]),
      categoryName: (tx: Transaction) =>
        tx.type === "investment"
          ? (tx.investmentAccountId && accountNames.get(tx.investmentAccountId)) || tx.assetName || "Investment"
          : resolveCategory(tx.categoryId, tx.categoryName, categoriesById).name,
    }
  }, [transactions, categories, accounts, range, period])

  const { totals } = report

  const downloadCsv = () => {
    const rows = [
      ["Date", "Type", "Description", "Category / Investment", `Amount (${getActiveCurrency()})`],
      ...report.inPeriod.map((t) => [t.date, t.type, t.description, report.categoryName(t), Number(t.amount) || 0]),
    ]
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `finmaester-${range.start}-to-${range.end}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const summaryText = () =>
    [
      `FinMaester summary · ${label}`,
      `Income: ${formatCurrency(totals.income)}`,
      `Expenses: ${formatCurrency(totals.expenses)}`,
      `Net: ${totals.net < 0 ? "-" : ""}${formatCurrency(Math.abs(totals.net))}`,
      `Invested: ${formatCurrency(totals.invested)}`,
      ...(report.breakdown.length
        ? ["Top spending:", ...report.breakdown.slice(0, 3).map((c) => `- ${c.name}: ${formatCurrency(c.amount)}`)]
        : []),
    ].join("\n")

  const shareSummary = async () => {
    const text = summaryText()
    try {
      if (navigator.share) {
        await navigator.share({ title: `FinMaester · ${label}`, text })
        return
      }
      await navigator.clipboard.writeText(text)
      toastSuccess("Summary copied, paste it anywhere")
    } catch (e: any) {
      if (e?.name !== "AbortError") toastError("Couldn't share the summary")
    }
  }

  return (
    <div className="space-y-6">
      <div className="print:hidden space-y-4">
        <PeriodFilter filter={filter} />
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => window.print()} className="gap-2" disabled={loading}>
            <Printer className="h-4 w-4" /> Print / Save as PDF
          </Button>
          <Button variant="outline" onClick={downloadCsv} className="gap-2" disabled={loading || !report.inPeriod.length}>
            <Download className="h-4 w-4" /> Download CSV
          </Button>
          <Button variant="outline" onClick={shareSummary} className="gap-2" disabled={loading}>
            <Share2 className="h-4 w-4" /> Share summary
          </Button>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : (
        <Card className="border-border/50 print:border-0 print:shadow-none">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary print:hidden" /> Financial report
                </CardTitle>
                <CardDescription>
                  {label} · {report.inPeriod.length} transaction{report.inPeriod.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <p className="text-xs text-muted-foreground text-right shrink-0">
                Generated
                <br />
                {format(new Date(), "d MMM yyyy")}
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Figure label="Income" value={formatCurrency(totals.income)} className="text-emerald-500" />
              <Figure label="Expenses" value={formatCurrency(totals.expenses)} className="text-red-500" />
              <Figure
                label="Net"
                value={`${totals.net < 0 ? "-" : ""}${formatCurrency(Math.abs(totals.net))}`}
                className={totals.net >= 0 ? "text-emerald-500" : "text-red-500"}
              />
              <Figure
                label="Savings rate"
                value={totals.savingsRate === null ? "—" : `${totals.savingsRate.toFixed(0)}%`}
              />
            </div>

            <ReportSection title="Spending by category">
              {report.breakdown.length === 0 ? (
                <Empty text="No expenses in this period." />
              ) : (
                <ReportTable
                  headers={["Category", "Transactions", "Share", "Amount"]}
                  rows={report.breakdown.map((c) => [
                    <span key="n" className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </span>,
                    c.count,
                    `${c.share.toFixed(0)}%`,
                    formatCurrency(c.amount),
                  ])}
                  footer={["Total", report.breakdown.reduce((s, c) => s + c.count, 0), "100%", formatCurrency(totals.expenses)]}
                />
              )}
            </ReportSection>

            {period === "month" && report.budgets.length > 0 && (
              <ReportSection title="Budgets">
                <ReportTable
                  headers={["Category", "Budget", "Spent", "Status"]}
                  rows={report.budgets.map((b) => [
                    b.name,
                    formatCurrency(b.budget),
                    formatCurrency(b.spent),
                    <span
                      key="s"
                      className={cn(
                        b.status === "over" ? "text-red-500" : b.status === "good" ? "text-emerald-500" : "text-amber-500",
                      )}
                    >
                      {b.status === "over"
                        ? `Over by ${formatCurrency(b.spent - b.budget)}`
                        : `${Math.round(b.percentUsed)}% used`}
                    </span>,
                  ])}
                />
              </ReportSection>
            )}

            <ReportSection title="Largest expenses">
              {report.largest.length === 0 ? (
                <Empty text="No expenses in this period." />
              ) : (
                <ReportTable
                  headers={["Date", "Description", "Category", "Amount"]}
                  rows={report.largest.map((t) => [
                    t.date ? format(fromDateKey(t.date), "d MMM") : "—",
                    t.description,
                    report.categoryName(t),
                    formatCurrency(Number(t.amount) || 0),
                  ])}
                />
              )}
            </ReportSection>

            <ReportSection title="Investments">
              {report.investments.length === 0 ? (
                <Empty text="No investments in this period." />
              ) : (
                <ReportTable
                  headers={["Investment", "Amount"]}
                  rows={report.investments.map(([name, amount]) => [name, formatCurrency(amount)])}
                  footer={["Total", formatCurrency(totals.invested)]}
                />
              )}
            </ReportSection>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Figure({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn("text-lg sm:text-xl font-bold truncate", className)}>{value}</p>
    </div>
  )
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 break-inside-avoid">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </section>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground">{text}</p>
}

function ReportTable({
  headers,
  rows,
  footer,
}: {
  headers: string[]
  rows: React.ReactNode[][]
  footer?: React.ReactNode[]
}) {
  const alignRight = (i: number) => i > 0 && i === headers.length - 1
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full text-sm">
        <thead className="text-muted-foreground bg-muted/30">
          <tr>
            {headers.map((h, i) => (
              <th key={h} className={cn("px-3 py-2 font-medium text-left whitespace-nowrap", alignRight(i) && "text-right")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, i) => (
                <td key={i} className={cn("px-3 py-2", alignRight(i) ? "text-right font-medium whitespace-nowrap" : "")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && (
          <tfoot className="border-t font-semibold">
            <tr>
              {footer.map((cell, i) => (
                <td key={i} className={cn("px-3 py-2", alignRight(i) && "text-right whitespace-nowrap")}>
                  {cell}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
