"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowDownIcon, ArrowUpIcon, BookOpen, Car, Coffee, Heart, Home, Landmark, Search, ShoppingBag, Wallet } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useTransactions } from "@/hooks/useTransactions"
import { formatCurrency } from "@/lib/formatCurrency"

// Icon mapping
const iconMap: Record<string, any> = {
  Briefcase: ShoppingBag,
  Wallet: Wallet,
  Car: Car,
  BookOpen: BookOpen,
  Heart: Heart,
  ShoppingBag: ShoppingBag,
  Landmark: Landmark,
  Coffee: Coffee,
  Home: Home,
}

export function RecentTransactions() {
  const { transactions, loading } = useTransactions()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTransactions = useMemo(() => {
    const recent = transactions.slice(0, 5) // Get only the 5 most recent
    return recent.filter(
      (transaction) =>
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (transaction.categoryName || "").toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [transactions, searchQuery])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest income and expenses</CardDescription>
          </div>
          <div className="w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                className="w-full sm:w-[250px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-6 text-muted-foreground">Loading transactions...</div>
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => {
              const IconComponent = iconMap[(transaction as any).icon] || ShoppingBag
              return (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${transaction.type === "income" ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"}`}
                    >
                      <IconComponent
                        className={`h-5 w-5 ${transaction.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.categoryName || "Uncategorized"}</p>
                      <p className="text-sm text-muted-foreground">{transaction.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end">
                      {transaction.type === "income" ? (
                        <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
                      )}
                      <p
                      className={`font-medium ${transaction.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {formatCurrency(transaction.amount)}
                    </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-6 text-muted-foreground">No transactions found matching your search.</div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/dashboard/transactions">View All Transactions</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
