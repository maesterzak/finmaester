"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BookOpen,
  Briefcase,
  CalendarDays,
  Car,
  Coffee,
  Heart,
  Landmark,
  MoreHorizontal,
  Pencil,
  Search,
  ShoppingBag,
  Trash2,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog"
import { useTransactions } from "@/hooks/useTransactions"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/formatCurrency"

// Icon mapping for categories
const iconMap: Record<string, any> = {
  Briefcase: Briefcase,
  Wallet: ShoppingBag,
  Car: Car,
  BookOpen: BookOpen,
  Heart: Heart,
  ShoppingBag: ShoppingBag,
  Landmark: Landmark,
  Coffee: Coffee,
  Home: ShoppingBag,
}

interface TransactionListProps {
  triggerAdd?: number
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function TransactionList({ triggerAdd }: TransactionListProps) {
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } = useTransactions()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)

  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())

  useEffect(() => {
    if (triggerAdd && triggerAdd > 0) {
      setIsAddDialogOpen(true)
      setEditingTransaction(null)
    }
  }, [triggerAdd])


  const filteredTransactions = transactions.filter((transaction) => {
    // Month/Year filter
    const txDate = new Date(transaction.date)
    const matchesMonth = txDate.getMonth() === selectedMonth && txDate.getFullYear() === selectedYear

    // Search filter
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase())

    // Type filter
    const matchesType = typeFilter === "all" || transaction.type === typeFilter

    return matchesMonth && matchesSearch && matchesType
  })

  const monthlyIncome = filteredTransactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0)
  const monthlyExpenses = filteredTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0)

  // Generate year options (current year + 2 years back and 1 year forward)
  const yearOptions = Array.from({ length: 4 }, (_, i) => currentDate.getFullYear() - 2 + i)


  const handleAddTransaction = async (newTransaction: any) => {
    console.log("Adding transaction 3", newTransaction)
    const success = await addTransaction({
      type: newTransaction.type,
      amount: newTransaction.amount,
      description: newTransaction.description,
      categoryId: newTransaction.categoryId,
      categoryName: newTransaction.category,
      date: newTransaction.date,
    })
    if (success) {
      setIsAddDialogOpen(false)
    }
  }

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction)
    setIsAddDialogOpen(true)
  }

  const handleUpdateTransaction = async (updatedTransaction: any) => {
    if (!updatedTransaction.id) return

    const success = await updateTransaction(updatedTransaction.id, {
      type: updatedTransaction.type,
      amount: updatedTransaction.amount,
      description: updatedTransaction.description,
      categoryId: updatedTransaction.categoryId,
      categoryName: updatedTransaction.category,
      date: updatedTransaction.date,
    })
    if (success) {
      setIsAddDialogOpen(false)
      setEditingTransaction(null)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id)
  }

  // const filteredTransactions = transactions.filter((transaction) => {
  //   // Search filter
  //   const matchesSearch =
  //     transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     (transaction.categoryName || "").toLowerCase().includes(searchQuery.toLowerCase())

  //   // Type filter
  //   const matchesType = typeFilter === "all" || transaction.type === typeFilter

  //   return matchesSearch && matchesType
  // })

  if (!loading) {
    return (
      <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">Filter by Month</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(Number.parseInt(v))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number.parseInt(v))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/50">
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">Income</p>
              <p className="text-lg font-bold text-emerald-500">+${monthlyIncome.toFixed(2)}</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">Expenses</p>
              <p className="text-lg font-bold text-red-500">-${monthlyExpenses.toFixed(2)}</p>
            </div>
            <div className="text-center sm:text-left col-span-2 sm:col-span-1">
              <p className="text-sm text-muted-foreground">Net</p>
              <p
                className={`text-lg font-bold ${monthlyIncome - monthlyExpenses >= 0 ? "text-emerald-500" : "text-red-500"}`}
              >
                ${(monthlyIncome - monthlyExpenses).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>
                Transactions for {months[selectedMonth]} {selectedYear}
              </CardTitle>
              <CardDescription>
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search transactions..."
                  className="w-full sm:w-[200px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expenses</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <TransactionTable
                transactions={filteredTransactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </TabsContent>

            <TabsContent value="income" className="mt-0">
              <TransactionTable
                transactions={filteredTransactions.filter((tx) => tx.type === "income")}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </TabsContent>

            <TabsContent value="expense" className="mt-0">
              <TransactionTable
                transactions={filteredTransactions.filter((tx) => tx.type === "expense")}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </TabsContent>
          </Tabs>
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>Manage your income and expenses</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search transactions..."
                  className="w-full sm:w-[200px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expenses</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <TransactionTable
                transactions={filteredTransactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </TabsContent>

            <TabsContent value="income" className="mt-0">
              <TransactionTable
                transactions={filteredTransactions.filter((tx) => tx.type === "income")}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </TabsContent>

            <TabsContent value="expense" className="mt-0">
              <TransactionTable
                transactions={filteredTransactions.filter((tx) => tx.type === "expense")}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </TabsContent>
          </Tabs>
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

interface TransactionTableProps {
  transactions: Transaction[]
  onEdit: (transaction: any) => void
  onDelete: (id: string) => void
}

function TransactionTable({ transactions, onEdit, onDelete }: TransactionTableProps) {
   if (transactions.length === 0) {
    return (
      <div className="text-center py-10">
        <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">No transactions found for this month.</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Try selecting a different month or add a new transaction.
        </p>
      </div>
    )
  }
  const getIcon = (categoryIcon?: string) => {
    if (!categoryIcon) return ShoppingBag
    return iconMap[categoryIcon] || ShoppingBag
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full caption-bottom text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="h-12 px-4 text-left font-medium">Date</th>
            <th className="h-12 px-4 text-left font-medium">Description</th>
            <th className="h-12 px-4 text-left font-medium">Category</th>
            <th className="h-12 px-4 text-left font-medium">Amount</th>
            <th className="h-12 px-4 text-left font-medium w-[70px]"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const IconComponent = getIcon((transaction as any).icon)
            return (
              <tr key={transaction.id} className="border-b">
                <td className="p-4 align-middle">{new Date(transaction.date).toLocaleDateString()}</td>
                <td className="p-4 align-middle font-medium">{transaction.description}</td>
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <span>{transaction.categoryName || "Uncategorized"}</span>
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <div className="flex items-center">
                    {transaction.type === "income" ? (
                      <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={
                        transaction.type === "income"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(transaction)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(transaction.id!)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
