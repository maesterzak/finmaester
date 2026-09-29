"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { CalendarDays, Search, SearchX, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog"
import { PeriodFilter } from "@/components/transactions/period-filter"
import { BudgetOverview } from "@/components/categories/budget-overview"
import { TransactionActions } from "@/components/transactions/transaction-actions"
import { TransactionAmount } from "@/components/transactions/transaction-amount"
import { toTransactionFields } from "@/components/transactions/transaction-fields"
import { PeriodSummary } from "@/components/analytics/period-summary"
import { SpendingChart } from "@/components/analytics/spending-chart"
import { useTransactions } from "@/hooks/useTransactions"
import { useCategories } from "@/hooks/useCategories"
import { usePeriodFilter } from "@/hooks/usePeriodFilter"
import type { Category, Transaction } from "@/lib/firebase/firestore"
import {
  type PeriodTotals,
  UNCATEGORIZED_ID,
  filterByRange,
  indexCategories,
  matchesRemark,
  normalizeSearchText,
  resolveCategory,
  summarize,
} from "@/lib/analytics"
import { getCategoryIcon } from "@/lib/category-icons"
import { formatCurrency } from "@/lib/formatCurrency"
import { fromDateKey, monthKeyOf, previousPeriodLabel } from "@/lib/periods"
import { cn } from "@/lib/utils"

interface TransactionListProps {
  triggerAdd?: number
}

type SearchScope = "period" | "all"

const INVESTMENT_CATEGORY_ID = "investment-cat"

export function TransactionList({ triggerAdd }: TransactionListProps) {
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } = useTransactions()
  const { categories, loading: categoriesLoading } = useCategories()
  const filter = usePeriodFilter()
  const { period, range, previousRange, label, categoryId, setCategoryId, anchor, includesToday } = filter

  // Budgets are monthly: use the month being viewed, or this month / the range's last month for longer periods
  const budgetMonthKey =
    period === "year" || period === "custom"
      ? includesToday
        ? monthKeyOf(new Date())
        : range.end.slice(0, 7)
      : monthKeyOf(anchor)

  const [searchQuery, setSearchQuery] = useState("")
  const [searchScope, setSearchScope] = useState<SearchScope>("period")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  useEffect(() => {
    if (triggerAdd && triggerAdd > 0) {
      setIsAddDialogOpen(true)
      setEditingTransaction(null)
    }
  }, [triggerAdd])

  const categoriesById = useMemo(() => indexCategories(categories), [categories])

  const matchesCategory = (tx: Transaction) => {
    if (categoryId === "all") return true
    if (categoryId === UNCATEGORIZED_ID) {
      return tx.categoryId !== INVESTMENT_CATEGORY_ID && (!tx.categoryId || !categoriesById.has(tx.categoryId))
    }
    return tx.categoryId === categoryId
  }

  // Period + category drive the summary; the remark search only narrows the list below it
  const periodTransactions = useMemo(
    () => filterByRange(transactions, range).filter(matchesCategory),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions, range, categoryId, categoriesById],
  )
  const previousTransactions = useMemo(
    () => filterByRange(transactions, previousRange).filter(matchesCategory),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions, previousRange, categoryId, categoriesById],
  )
  const categoryFilteredTransactions = useMemo(
    () => transactions.filter(matchesCategory),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions, categoryId, categoriesById],
  )

  const normalizedQuery = normalizeSearchText(searchQuery)
  const isSearching = normalizedQuery.length > 0

  const visibleTransactions = useMemo(() => {
    if (!normalizedQuery) return periodTransactions
    const pool = searchScope === "all" ? categoryFilteredTransactions : periodTransactions
    return pool.filter((tx) => matchesRemark(tx, normalizedQuery))
  }, [normalizedQuery, searchScope, periodTransactions, categoryFilteredTransactions])

  const current = useMemo(() => summarize(periodTransactions), [periodTransactions])
  const previous = useMemo(() => summarize(previousTransactions), [previousTransactions])
  const searchTotals = useMemo(() => summarize(visibleTransactions), [visibleTransactions])

  const handleAddTransaction = async (newTransaction: any) => {
    const success = await addTransaction(toTransactionFields(newTransaction))
    if (success) {
      setIsAddDialogOpen(false)
    }
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsAddDialogOpen(true)
  }

  const handleUpdateTransaction = async (updatedTransaction: any) => {
    if (!updatedTransaction.id) return

    const success = await updateTransaction(updatedTransaction.id, toTransactionFields(updatedTransaction))
    if (success) {
      setIsAddDialogOpen(false)
      setEditingTransaction(null)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id)
  }

  const byType = (type?: Transaction["type"]) =>
    type ? visibleTransactions.filter((tx) => tx.type === type) : visibleTransactions

  const selectedCategoryName =
    categoryId === "all"
      ? null
      : categoryId === UNCATEGORIZED_ID
        ? "Uncategorized"
        : categoriesById.get(categoryId)?.name || "Deleted category"

  const listTitle = isSearching && searchScope === "all" ? "All time" : label

  return (
    <div className="space-y-6">
      <PeriodFilter filter={filter}>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <PeriodSummary current={current} previous={previous} previousLabel={previousPeriodLabel[period]} />
        )}
      </PeriodFilter>

      {!loading && !categoriesLoading && (
        <BudgetOverview categories={categories} transactions={transactions} monthKey={budgetMonthKey} />
      )}

      {!loading && (
        <SpendingChart
          transactions={categoryFilteredTransactions}
          period={period}
          range={range}
          label={selectedCategoryName ? `${label} · ${selectedCategoryName}` : label}
        />
      )}

      <Card>
        <CardHeader className="space-y-4">
          <div className="min-w-0">
            <CardTitle className="break-words">Transactions · {listTitle}</CardTitle>
            <CardDescription>
              {loading
                ? "Loading…"
                : `${visibleTransactions.length} transaction${visibleTransactions.length !== 1 ? "s" : ""} found`}
              {selectedCategoryName && ` in ${selectedCategoryName}`}
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
            <div className="relative flex-1 sm:min-w-[240px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                inputMode="search"
                enterKeyHint="search"
                placeholder='Search remarks, e.g. "Gift to AI"'
                aria-label="Search transaction remarks"
                className="pl-8 pr-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {isSearching && (
              <Tabs value={searchScope} onValueChange={(v) => setSearchScope(v as SearchScope)}>
                <TabsList className="grid w-full grid-cols-2 sm:w-[220px]">
                  <TabsTrigger value="period" className="text-xs sm:text-sm">
                    This period
                  </TabsTrigger>
                  <TabsTrigger value="all" className="text-xs sm:text-sm">
                    All time
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            <CategorySelect categories={categories} value={categoryId} onChange={setCategoryId} />
          </div>

          {isSearching && !loading && (
            <SearchResultsSummary
              query={searchQuery.trim()}
              totals={searchTotals}
              scopeLabel={searchScope === "all" ? "all time" : label}
              categoryName={selectedCategoryName}
            />
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="all" className="text-xs sm:text-sm px-1">
                  All
                </TabsTrigger>
                <TabsTrigger value="income" className="text-xs sm:text-sm px-1">
                  Income
                </TabsTrigger>
                <TabsTrigger value="expense" className="text-xs sm:text-sm px-1">
                  Expenses
                </TabsTrigger>
                <TabsTrigger value="investment" className="text-xs sm:text-sm px-1">
                  <span className="sm:hidden">Invest.</span>
                  <span className="hidden sm:inline">Investments</span>
                </TabsTrigger>
              </TabsList>

              {([undefined, "income", "expense", "investment"] as const).map((type) => (
                <TabsContent key={type ?? "all"} value={type ?? "all"} className="mt-0 w-full">
                  <TransactionTable
                    transactions={byType(type)}
                    categoriesById={categoriesById}
                    highlight={normalizedQuery}
                    emptyMessage={
                      isSearching ? `No remarks contain "${searchQuery.trim()}".` : "No transactions found for this period."
                    }
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>

      <AddTransactionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddTransaction}
        onUpdate={handleUpdateTransaction}
        transaction={editingTransaction}
      />
    </div>
  )
}

function SearchResultsSummary({
  query,
  totals,
  scopeLabel,
  categoryName,
}: {
  query: string
  totals: PeriodTotals
  scopeLabel: string
  categoryName: string | null
}) {
  const total = totals.income + totals.expenses + totals.invested
  const breakdown = [
    { label: "Expenses", value: totals.expenses, className: "text-red-500" },
    { label: "Income", value: totals.income, className: "text-emerald-500" },
    { label: "Investments", value: totals.invested, className: "text-blue-500" },
  ].filter((b) => b.value > 0)

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 sm:p-4">
      {totals.count === 0 ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SearchX className="h-4 w-4 shrink-0" />
          <span className="break-words min-w-0">
            No remarks contain &ldquo;{query}&rdquo; in {scopeLabel}
            {categoryName && ` (${categoryName})`}.
          </span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground break-words">
              {totals.count} match{totals.count !== 1 ? "es" : ""} for &ldquo;
              <span className="font-medium text-foreground">{query}</span>&rdquo; in {scopeLabel}
              {categoryName && ` · ${categoryName}`}
            </p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(total)}</p>
          </div>
          {breakdown.length > 1 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {breakdown.map((b) => (
                <span key={b.label} className="whitespace-nowrap">
                  <span className="text-muted-foreground">{b.label}: </span>
                  <span className={cn("font-semibold", b.className)}>{formatCurrency(b.value)}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CategorySelect({
  categories,
  value,
  onChange,
}: {
  categories: Category[]
  value: string
  onChange: (value: string) => void
}) {
  // A category from the URL that no longer exists still needs an option to display
  const isKnown = value === "all" || value === UNCATEGORIZED_ID || categories.some((c) => c.id === value)

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[180px]">
        <SelectValue placeholder="All categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All categories</SelectItem>
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.icon)
          return (
            <SelectItem key={cat.id} value={cat.id!}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" style={{ color: cat.color }} /> {cat.name}
              </div>
            </SelectItem>
          )
        })}
        <SelectItem value={UNCATEGORIZED_ID}>Uncategorized</SelectItem>
        {!isKnown && <SelectItem value={value}>Deleted category</SelectItem>}
      </SelectContent>
    </Select>
  )
}

// Wraps every case-insensitive occurrence of `query` in a <mark>
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  // Match the normalized query while tolerating any run of whitespace in the original text
  const pattern = query
    .split(" ")
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("\\s+")
  const parts = text.split(new RegExp(`(${pattern})`, "gi"))
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm bg-primary/25 text-foreground px-0.5">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}

interface TransactionTableProps {
  transactions: Transaction[]
  categoriesById: Map<string, Category>
  highlight: string
  emptyMessage: string
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

function TransactionTable({ transactions, categoriesById, highlight, emptyMessage, onEdit, onDelete }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10">
        <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground break-words">{emptyMessage}</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Try a different period or category, or add a new transaction.
        </p>
      </div>
    )
  }

  const rows = transactions.map((tx) => {
    const category =
      tx.type === "investment"
        ? { name: tx.assetName || "Investment", color: "hsl(217, 91%, 60%)", icon: "Coins" }
        : resolveCategory(tx.categoryId, tx.categoryName, categoriesById)
    return { tx, category, Icon: getCategoryIcon(category.icon) }
  })

  return (
    <>
      {/* Phones: stacked list */}
      <ul className="sm:hidden divide-y divide-border rounded-lg border">
        {rows.map(({ tx, category, Icon }) => (
          <li key={tx.id} className="flex items-center gap-3 py-2.5 pl-3 pr-1">
            <span className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `${category.color}20` }}>
              <Icon className="h-4 w-4" style={{ color: category.color }} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium break-words">
                <Highlight text={tx.description || ""} query={highlight} />
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {tx.date ? format(fromDateKey(tx.date), "d MMM yyyy") : "—"} · {category.name}
              </p>
            </div>
            <TransactionAmount transaction={tx} className="text-sm" />
            <TransactionActions transaction={tx} onEdit={onEdit} onDelete={onDelete} />
          </li>
        ))}
      </ul>

      {/* Tablet and up: table */}
      <div className="hidden sm:block relative overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm text-left">
          <thead className="text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
              <th className="px-2 py-3 w-12"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {rows.map(({ tx, category, Icon }) => (
              <tr key={tx.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {tx.date ? format(fromDateKey(tx.date), "d MMM yyyy") : "—"}
                </td>
                <td className="px-4 py-3 font-medium">
                  <Highlight text={tx.description || ""} query={highlight} />
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0" style={{ color: category.color }} />
                    {category.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <TransactionAmount transaction={tx} />
                </td>
                <td className="px-2 py-3">
                  <TransactionActions transaction={tx} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
