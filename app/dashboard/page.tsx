"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { FinanceSummary } from "@/components/dashboard/finance-summary"
import { ExpenseCharts } from "@/components/dashboard/expense-charts"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { AiAdvisor } from "@/components/dashboard/ai-advisor"
import { BudgetAlerts } from "@/components/dashboard/budget-alerts"
import { RecurringExpenses } from "@/components/dashboard/recurring-expenses"
import { TargetWidget } from "@/components/investments/target-card"
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog"
import { toTransactionFields } from "@/components/transactions/transaction-fields"
import { useAuth } from "@/contexts/AuthContext"
import { useCategories } from "@/hooks/useCategories"
import { useTransactions } from "@/hooks/useTransactions"
import { useInvestments } from "@/hooks/useInvestments"
import { targetProgress } from "@/lib/investments"

function greeting(hour: number) {
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { categories, loading: categoriesLoading } = useCategories()
  const { transactions, addTransaction } = useTransactions()
  const { targets, loading: investmentsLoading } = useInvestments()
  const [addOpen, setAddOpen] = useState(false)

  const investmentProgress = useMemo(() => targetProgress(transactions, targets), [transactions, targets])
  const firstName = user?.displayName?.split(" ")[0]
  const now = new Date()

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <DashboardHeader
        title={`${greeting(now.getHours())}${firstName ? `, ${firstName}` : ""}`}
        description={`Here's your money at a glance · ${format(now, "EEEE, d MMMM")}`}
        action={
          <Button onClick={() => setAddOpen(true)} className="w-full sm:w-auto gap-1.5">
            <Plus className="h-4 w-4" /> Add transaction
          </Button>
        }
      />

      {!categoriesLoading && <BudgetAlerts categories={categories} transactions={transactions} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <FinanceSummary />
          <ExpenseCharts transactions={transactions} categories={categories} />
          <RecentTransactions categories={categories} />
          <RecurringExpenses />
        </div>

        <div className="space-y-6 min-w-0">
          {!investmentsLoading && <TargetWidget progress={investmentProgress} />}
          <AiAdvisor />
        </div>
      </div>

      <AddTransactionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={(tx) => addTransaction(toTransactionFields(tx))}
      />
    </div>
  )
}
