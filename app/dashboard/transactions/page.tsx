"use client"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { TransactionList } from "@/components/transactions/transaction-list"
import { AddTransactionButton } from "@/components/transactions/add-transaction-button"
import { useState } from "react"

export default function TransactionsPage() {
  const [triggerAdd, setTriggerAdd] = useState(0)
  return (
    <div className="container mx-auto p-4 md:p-6 ">
      <DashboardHeader
        title="Transactions"
        description="Manage your income and expenses"
        action={<AddTransactionButton onClick={() => setTriggerAdd(prev => prev + 1)} />}
      />
      <TransactionList triggerAdd={triggerAdd} />
    </div>
  )
}
