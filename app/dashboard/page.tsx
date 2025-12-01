"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { FinanceSummary } from "@/components/dashboard/finance-summary"
import { ExpenseCharts } from "@/components/dashboard/expense-charts"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { ChatbotWidget } from "@/components/dashboard/chatbot-widget"
import { BudgetAlerts } from "@/components/dashboard/budget-alerts"
import { IncomeVsExpense } from "@/components/dashboard/income-vs-expense"
import { RecurringExpenses } from "@/components/dashboard/recurring-expenses"
import { useCategories } from "@/hooks/useCategories"
import { useTransactions } from "@/hooks/useTransactions"
import { useMemo } from "react"

export default function DashboardPage() {
  const { categories, loading: categoriesLoading } = useCategories()
  const { transactions } = useTransactions()

  // Calculate spent amounts for each category
  const categoriesWithSpent = useMemo(() => {
    return categories.map((category) => {
      const currentMonth = new Date().toISOString().slice(0, 7) 
      const categoryTransactions = transactions.filter(
  (t) =>
    t.categoryId === category.id &&
    t.type === "expense" &&
    t.date.slice(0, 7) === currentMonth
)
      const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0)
      return {
        ...category,
        spent,
      }
    })
  }, [categories, transactions])

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fade-in">
        <DashboardHeader />

        <div className="animate-slide-in" style={{ animationDelay: "0.05s" }}>
          <BudgetAlerts categories={categoriesWithSpent} />
        </div>

        {/* Main content grid - responsive for all devices */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Left column - main content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="animate-slide-in" style={{ animationDelay: "0.1s" }}>
              <FinanceSummary />
            </div>

            

            <div className="animate-slide-in" style={{ animationDelay: "0.2s" }}>
              <ExpenseCharts transactions={transactions} />
            </div>

            <div className="animate-slide-in" style={{ animationDelay: "0.25s" }}>
              <RecurringExpenses />
            </div>

            <div className="animate-slide-in" style={{ animationDelay: "0.3s" }}>
              <RecentTransactions />
            </div>
          </div>

          {/* Right column - sidebar widget */}
          <div className="animate-slide-in" style={{ animationDelay: "0.4s" }}>
            <ChatbotWidget />
          </div>
        </div>
      </div>
    </div>
  )
}
