"use client"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { TransactionList } from "@/components/transactions/transaction-list"
import { AddTransactionButton } from "@/components/transactions/add-transaction-button"
import { Suspense, useState } from "react"

export default function TransactionsPage() {
  const [triggerAdd, setTriggerAdd] = useState(0)
  return (
    <div className="container mx-auto p-4 md:p-6 ">
      <DashboardHeader
        title="Transactions"
        description="Everything you've earned, spent and invested"
        action={<AddTransactionButton onClick={() => setTriggerAdd(prev => prev + 1)} />}
      />
      {/* TransactionList reads its filters from the URL (useSearchParams), which needs a Suspense boundary */}
      <Suspense>
        <TransactionList triggerAdd={triggerAdd} />
      </Suspense>
    </div>
  )
}
