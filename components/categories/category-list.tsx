"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  BookOpen,
  Car,
  MoreHorizontal,
  Pencil,
  Trash2,
  Wallet,
  Briefcase,
  Heart,
  TrendingUp,
  TrendingDown,
  Receipt,
  FolderOpen,
  DollarSign,
  Copy,
  List,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { AddCategoryDialog } from "@/components/categories/add-category-dialog"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useCategories } from "@/hooks/useCategories"
import { useTransactions } from "@/hooks/useTransactions"
import { CategoryTransactionsSheet } from "@/components/categories/category-transactions-sheet"
import { getCategoryIcon } from "@/lib/category-icons"
import { formatCurrency, formatCurrencyNoDecimals } from "@/lib/formatCurrency"
import type { Category } from "@/lib/firebase/firestore"

interface CategoryListProps {
  selectedMonth: number
  selectedYear: number
}

const monthNames = [
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

const initialCategories = [
  {
    id: "c1",
    name: "Investment",
    icon: Briefcase,
    color: "#8884d8",
    // Monthly budgets keyed by "YYYY-MM"
    monthlyBudgets: {
      "2025-12": 1000,
      "2025-11": 800,
    },
    monthlySpending: {
      "2025-12": { spent: 0, transactions: 0 },
      "2025-11": { spent: 750, transactions: 5 },
    },
  },
  {
    id: "c2",
    name: "Savings",
    icon: Wallet,
    color: "#82ca9d",
    monthlyBudgets: {
      "2025-12": 500,
      "2025-11": 500,
    },
    monthlySpending: {
      "2025-12": { spent: 0, transactions: 0 },
      "2025-11": { spent: 500, transactions: 1 },
    },
  },
  {
    id: "c3",
    name: "Transport",
    icon: Car,
    color: "#ffc658",
    monthlyBudgets: {
      "2025-12": 0,
      "2025-11": 300,
    },
    monthlySpending: {
      "2025-12": { spent: 0, transactions: 0 },
      "2025-11": { spent: 250, transactions: 8 },
    },
  },
  {
    id: "c4",
    name: "Education",
    icon: BookOpen,
    color: "#ff8042",
    monthlyBudgets: {
      "2025-12": 0,
      "2025-11": 400,
    },
    monthlySpending: {
      "2025-12": { spent: 0, transactions: 0 },
      "2025-11": { spent: 350, transactions: 3 },
    },
  },
  {
    id: "c5",
    name: "Personal Enjoyment",
    icon: Heart,
    color: "#0088fe",
    monthlyBudgets: {
      "2025-12": 0,
      "2025-11": 200,
    },
    monthlySpending: {
      "2025-12": { spent: 0, transactions: 0 },
      "2025-11": { spent: 180, transactions: 12 },
    },
  },
]
interface CategoryListProps {
  triggerAdd?: number
}
export function CategoryList({ triggerAdd, selectedMonth, selectedYear }: CategoryListProps) {
//   const [categories, setCategories] = useState(initialCategories)
  const { categories, loading, addCategory, updateCategory, deleteCategory, setMonthlyBudgets, refreshCategories } =
    useCategories()
  const transactionsState = useTransactions()
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [budgetCategory, setBudgetCategory] = useState<any>(null)
  const [budgetAmount, setBudgetAmount] = useState("")
  const [copyDialogOpen, setCopyDialogOpen] = useState(false)
  const { toast } = useToast()


  // Open dialog when triggerAdd changes
    useEffect(() => {
      if (triggerAdd && triggerAdd > 0) {
        setIsAddDialogOpen(true)
        setEditingCategory(null)
      }
    }, [triggerAdd])

  const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`

  const handleAddCategory = async (newCategory: any) => {
    const success = await addCategory({
      name: newCategory.name,
      icon: newCategory.icon,
      color: newCategory.color,
      budget: newCategory.budget,
      spent: 0,
      monthlyBudgets: {
          [monthKey]: newCategory.budget || 0,
        },
        monthlySpending: {
          [monthKey]: { spent: 0, transactions: 0 },
        }
    })
    if (success) {
      setIsAddDialogOpen(false)
    }
  }
  const handleEditCategory = (category: any) => {
    setEditingCategory(category)
    setIsAddDialogOpen(true)
  }

  const handleUpdateCategory = async (updatedCategory: any) => {
    if (!updatedCategory.id) return

    const success = await updateCategory(updatedCategory.id, {
      name: updatedCategory.name,
      icon: updatedCategory.icon,
      color: updatedCategory.color,
      budget: updatedCategory.budget,
    })
    if (success) {
      setIsAddDialogOpen(false)
      setEditingCategory(null)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id)
  }
  const handleSetBudget = (category: any) => {
    setBudgetCategory(category)
    const currentBudget = category.monthlyBudgets?.[monthKey] || 0
    setBudgetAmount(currentBudget.toString())
    setBudgetDialogOpen(true)
  }

  const handleSaveBudget = async () => {
    if (!budgetCategory) return

    const amount = Number.parseFloat(budgetAmount) || 0

    // Only this month's budget is written, so other months' budgets are kept
    const succeeded = await setMonthlyBudgets(monthKey, [{ categoryId: budgetCategory.id, amount }])

    if (succeeded > 0) {
      toast({
        title: "Budget updated",
        description: `${budgetCategory.name} budget set to ${formatCurrency(amount)} for ${monthNames[selectedMonth]} ${selectedYear}`,
      })
    }
    setBudgetDialogOpen(false)
    setBudgetCategory(null)
    setBudgetAmount("")
  }

  const handleCopyFromPreviousMonth = async () => {
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear
    const prevMonthKey = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}`

    const budgetsToCopy = categories
      .filter((cat) => cat.id && (cat.monthlyBudgets?.[prevMonthKey] || 0) > 0)
      .map((cat) => ({ categoryId: cat.id!, amount: cat.monthlyBudgets![prevMonthKey] }))

    const copiedCount = budgetsToCopy.length > 0 ? await setMonthlyBudgets(monthKey, budgetsToCopy) : 0

    if (copiedCount > 0) {
      toast({
        title: "Budgets copied",
        description: `Copied ${copiedCount} budget(s) from ${monthNames[prevMonth]} ${prevYear}`,
      })
    } else if (budgetsToCopy.length === 0) {
      toast({
        title: "No budgets to copy",
        description: `No budgets found in ${monthNames[prevMonth]} ${prevYear}`,
        variant: "destructive",
      })
    }
    setCopyDialogOpen(false)
  }

  const getBudgetStatus = (spent: number, budget: number) => {
    if (budget === 0) return { status: "unset", color: "text-muted-foreground", bgColor: "bg-muted/50" }
    const percentage = (spent / budget) * 100
    if (percentage >= 100) return { status: "over", color: "text-red-500", bgColor: "bg-red-500/10" }
    if (percentage >= 75) return { status: "warning", color: "text-amber-500", bgColor: "bg-amber-500/10" }
    return { status: "good", color: "text-emerald-500", bgColor: "bg-emerald-500/10" }
  }

  const getMonthlyData = (category: any) => {
    const spending = category.monthlySpending?.[monthKey] || { spent: 0, transactions: 0 }
    const budget = category.monthlyBudgets?.[monthKey] || 0
    return { ...spending, budget }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setCopyDialogOpen(true)} className="gap-2">
          <Copy className="h-4 w-4" />
          Copy from Previous Month
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {categories.map((category) => {
          const monthData = getMonthlyData(category)
          const spent = monthData.spent
          const transactions = monthData.transactions
          const budget = monthData.budget
          const remaining = budget - spent
          const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
          const budgetStatus = getBudgetStatus(spent, budget)
          const isOverBudget = budget > 0 && spent > budget
          const hasBudget = budget > 0
          const CategoryIcon = getCategoryIcon(category.icon)

          return (
            <Card
              key={category.id}
              role="button"
              tabIndex={0}
              aria-label={`View ${category.name} transactions`}
              onClick={() => setViewingCategory(category)}
              onKeyDown={(e) => {
                if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault()
                  setViewingCategory(category)
                }
              }}
              className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-border/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="h-1" style={{ backgroundColor: category.color }} />

              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl shadow-sm" style={{ backgroundColor: `${category.color}20` }}>
                      <CategoryIcon className="h-5 w-5" style={{ color: category.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">{category.name}</CardTitle>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Receipt className="h-3 w-3" />
                        <span>
                          {transactions} transaction{transactions !== 1 ? "s" : ""} this month
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Menu clicks bubble through the portal to the card, so stop them here */}
                  <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewingCategory(category)}>
                        <List className="mr-2 h-4 w-4" />
                        View Transactions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSetBudget(category)}>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Set Budget for {monthNames[selectedMonth]}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Category
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteCategory(category?.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {!hasBudget ? (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <div className="p-3 rounded-full bg-muted/50 mb-3">
                      <DollarSign className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No budget set</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {transactions > 0
                        ? `${transactions} transaction(s), ${formatCurrency(spent)} spent`
                        : "No transactions this month"}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 gap-2 bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSetBudget(category)
                      }}
                    >
                      <DollarSign className="h-3.5 w-3.5" />
                      Set {monthNames[selectedMonth]} Budget
                    </Button>
                  </div>
                ) : transactions === 0 ? (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <FolderOpen className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">No transactions this month</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Budget: {formatCurrency(budget)}</p>
                  </div>
                ) : (
                  <>
                    <div className={cn("rounded-lg p-3 flex items-center justify-between", budgetStatus.bgColor)}>
                      <div className="flex items-center gap-2">
                        {isOverBudget ? (
                          <TrendingDown className={cn("h-4 w-4", budgetStatus.color)} />
                        ) : (
                          <TrendingUp className={cn("h-4 w-4", budgetStatus.color)} />
                        )}
                        <span className="text-sm font-medium text-muted-foreground">
                          {isOverBudget ? "Over budget" : "Remaining"}
                        </span>
                      </div>
                      <span className={cn("text-lg font-bold", budgetStatus.color)}>
                        {isOverBudget ? "-" : ""}
                        {formatCurrency(Math.abs(remaining))}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Budget</p>
                        <p className="text-sm font-semibold mt-0.5">{formatCurrency(budget)}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Spent</p>
                        <p className="text-sm font-semibold mt-0.5">{formatCurrency(spent)}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Progress
                        value={percentage}
                        className="h-2"
                        indicatorClassName={cn(
                          isOverBudget ? "bg-red-500" : percentage >= 75 ? "bg-amber-500" : "bg-emerald-500",
                        )}
                      />
                      <div className="flex justify-between items-center text-xs">
                        <span className={cn("font-medium", budgetStatus.color)}>{Math.round(percentage)}% used</span>
                        <span className="text-muted-foreground">
                          {formatCurrencyNoDecimals(spent)} / {formatCurrencyNoDecimals(budget)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              Set Budget for {monthNames[selectedMonth]} {selectedYear}
            </DialogTitle>
            <DialogDescription>
              Set the budget amount for <span className="font-medium">{budgetCategory?.name}</span> this month. This
              budget is specific to {monthNames[selectedMonth]} and won't affect other months.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="budget-amount" className="text-sm font-medium">
              Budget Amount
            </Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₦</span>
              <Input
                id="budget-amount"
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Enter 0 to clear the budget for this month.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBudgetDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBudget}>Save Budget</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Copy Budgets from Previous Month</DialogTitle>
            <DialogDescription>
              This will copy all budget amounts from{" "}
              <span className="font-medium">
                {monthNames[selectedMonth === 0 ? 11 : selectedMonth - 1]}{" "}
                {selectedMonth === 0 ? selectedYear - 1 : selectedYear}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {monthNames[selectedMonth]} {selectedYear}
              </span>
              . Existing budgets for this month will be overwritten.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCopyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCopyFromPreviousMonth}>Copy Budgets</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CategoryTransactionsSheet
        category={viewingCategory}
        onOpenChange={(open) => !open && setViewingCategory(null)}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        transactionsState={transactionsState}
        onTransactionsChanged={refreshCategories}
      />

      <AddCategoryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddCategory}
        onUpdate={handleUpdateCategory}
        category={editingCategory}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
    </div>
  )
}
