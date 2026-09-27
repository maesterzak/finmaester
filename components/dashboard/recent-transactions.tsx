"use client"

import { useMemo } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowRight, Receipt } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TransactionAmount } from "@/components/transactions/transaction-amount"
import { useTransactions } from "@/hooks/useTransactions"
import type { Category } from "@/lib/firebase/firestore"
import { indexCategories, resolveCategory } from "@/lib/analytics"
import { getCategoryIcon } from "@/lib/category-icons"
import { fromDateKey } from "@/lib/periods"

const INVESTMENT_COLOR = "hsl(217, 91%, 60%)"

export function RecentTransactions({ categories }: { categories: Category[] }) {
  const { transactions, loading } = useTransactions({ limitCount: 6 })
  const categoriesById = useMemo(() => indexCategories(categories), [categories])

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-xl">Recent Transactions</CardTitle>
            <CardDescription>Your latest activity</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 shrink-0">
            <Link href="/dashboard/transactions">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Receipt className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
            <Button asChild size="sm" className="mt-3">
              <Link href="/dashboard/transactions">Add your first transaction</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {transactions.map((tx) => {
              const category =
                tx.type === "investment"
                  ? { name: tx.assetName || "Investment", color: INVESTMENT_COLOR, icon: "Coins" }
                  : resolveCategory(tx.categoryId, tx.categoryName, categoriesById)
              const Icon = getCategoryIcon(category.icon)
              return (
                <li key={tx.id} className="flex items-center gap-3 py-3">
                  <span className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `${category.color}20` }}>
                    <Icon className="h-4 w-4" style={{ color: category.color }} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description || category.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {category.name} · {tx.date ? format(fromDateKey(tx.date), "d MMM") : "—"}
                    </p>
                  </div>
                  <TransactionAmount transaction={tx} className="text-sm" />
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
