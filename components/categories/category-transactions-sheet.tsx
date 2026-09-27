"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowRight, FolderOpen } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog"
import { TransactionActions } from "@/components/transactions/transaction-actions"
import { TransactionAmount } from "@/components/transactions/transaction-amount"
import { toTransactionFields } from "@/components/transactions/transaction-fields"
import { chartAxisProps, chartGridProps, chartTooltipProps } from "@/components/analytics/chart-theme"
import type { useTransactions } from "@/hooks/useTransactions"
import type { Category, Transaction } from "@/lib/firebase/firestore"
import { buildTimeSeries, filterByRange } from "@/lib/analytics"
import { DEFAULT_CATEGORY_COLOR, getCategoryIcon } from "@/lib/category-icons"
import { formatCurrency, formatCurrencyCompact } from "@/lib/formatCurrency"
import { fromDateKey, getPeriodRange } from "@/lib/periods"
import { cn } from "@/lib/utils"

interface CategoryTransactionsSheetProps {
  category: Category | null
  onOpenChange: (open: boolean) => void
  selectedMonth: number
  selectedYear: number
  transactionsState: ReturnType<typeof useTransactions>
  onTransactionsChanged: () => void
}

export function CategoryTransactionsSheet({
  category,
  onOpenChange,
  selectedMonth,
  selectedYear,
  transactionsState,
  onTransactionsChanged,
}: CategoryTransactionsSheetProps) {
  const { transactions, loading, updateTransaction, deleteTransaction } = transactionsState
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const monthStart = new Date(selectedYear, selectedMonth, 1)
  const monthKey = format(monthStart, "yyyy-MM")
  const monthLabel = format(monthStart, "MMMM yyyy")
  const range = useMemo(() => getPeriodRange("month", monthStart), [monthKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const categoryTransactions = useMemo(
    () => (category ? filterByRange(transactions, range).filter((t) => t.categoryId === category.id) : []),
    [transactions, range, category],
  )
  const dailyData = useMemo(() => buildTimeSeries(categoryTransactions, "month", range), [categoryTransactions, range])

  if (!category) {
    return <Sheet open={false} onOpenChange={onOpenChange} />
  }

  const Icon = getCategoryIcon(category.icon)
  const color = category.color || DEFAULT_CATEGORY_COLOR
  const spent = categoryTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  const budget = category.monthlyBudgets?.[monthKey] || 0
  const remaining = budget - spent
  const hasSpending = dailyData.some((d) => d.expense > 0)

  const handleUpdateTransaction = async (updated: any) => {
    if (!updated.id) return
    const success = await updateTransaction(updated.id, toTransactionFields(updated))
    if (success) {
      setEditingTransaction(null)
      onTransactionsChanged()
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    const success = await deleteTransaction(id)
    if (success) onTransactionsChanged()
  }

  const viewAllHref = `/dashboard/transactions?period=month&date=${monthKey}-01&category=${category.id}`

  return (
    <>
      <Sheet open onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
          <div className="h-1" style={{ backgroundColor: color }} />
          <div className="p-6 space-y-6">
            <SheetHeader className="text-left">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl shadow-sm" style={{ backgroundColor: `${color}20` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <div>
                  <SheetTitle>{category.name}</SheetTitle>
                  <SheetDescription>Transactions for {monthLabel}</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="grid grid-cols-3 gap-3">
              <Stat label="Budget" value={budget > 0 ? formatCurrency(budget) : "Not set"} />
              <Stat label="Spent" value={formatCurrency(spent)} />
              <Stat
                label={remaining < 0 ? "Over" : "Remaining"}
                value={budget > 0 ? formatCurrency(Math.abs(remaining)) : "—"}
                valueClass={budget > 0 ? (remaining < 0 ? "text-red-500" : "text-emerald-500") : undefined}
              />
            </div>

            {hasSpending && (
              <div>
                <p className="text-sm font-medium mb-2">Daily spending</p>
                <div className="h-[160px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <CartesianGrid {...chartGridProps} />
                      <XAxis dataKey="label" {...chartAxisProps} minTickGap={16} />
                      <YAxis {...chartAxisProps} width={48} tickFormatter={(v: number) => formatCurrencyCompact(v)} />
                      <Tooltip {...chartTooltipProps} formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="expense" name="Spent" fill={color} radius={[3, 3, 0, 0]} maxBarSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-2">
                {categoryTransactions.length} transaction{categoryTransactions.length !== 1 ? "s" : ""}
              </p>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : categoryTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center rounded-lg border border-dashed">
                  <FolderOpen className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No transactions in {monthLabel}</p>
                </div>
              ) : (
                <ul className="divide-y divide-border rounded-lg border">
                  {categoryTransactions.map((tx) => (
                    <li key={tx.id} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.date ? format(fromDateKey(tx.date), "EEE, d MMM") : "—"}
                        </p>
                      </div>
                      <TransactionAmount transaction={tx} className="text-sm" />
                      <TransactionActions
                        transaction={tx}
                        onEdit={setEditingTransaction}
                        onDelete={handleDeleteTransaction}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button asChild variant="outline" className="w-full gap-2">
              <Link href={viewAllHref}>
                View all in Transactions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AddTransactionDialog
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
        onAdd={() => {}}
        onUpdate={handleUpdateTransaction}
        transaction={editingTransaction}
      />
    </>
  )
}

function Stat({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-2.5 text-center min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      <p className={cn("text-sm font-semibold mt-0.5 truncate", valueClass)}>{value}</p>
    </div>
  )
}
