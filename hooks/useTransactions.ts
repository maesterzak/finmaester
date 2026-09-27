"use client"

import { useMemo } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useFinanceResource } from "@/contexts/FinanceDataContext"
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  type Transaction,
} from "@/lib/firebase/firestore"
import { toastSuccess, toastError } from "@/lib/toast"

interface UseTransactionsOptions {
  limitCount?: number
  startDate?: string
  endDate?: string
}

// Reads from the shared FinanceDataProvider, so every widget uses one fetch of the user's transactions
export function useTransactions(options?: UseTransactionsOptions) {
  const { user } = useAuth()
  const { data, loading, reload } = useFinanceResource("transactions")

  const { startDate, endDate, limitCount } = options ?? {}
  const transactions = useMemo(() => {
    let list = data
    if (startDate) list = list.filter((t) => t.date >= startDate)
    if (endDate) list = list.filter((t) => t.date <= endDate)
    if (limitCount) list = list.slice(0, limitCount)
    return list
  }, [data, startDate, endDate, limitCount])

  const handleAddTransaction = async (transactionData: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt">) => {
    if (!user) return false
    const { error } = await addTransaction({
      ...transactionData,
      userId: user.uid,
    })

    if (error) {
      toastError("Failed to add transaction")
      return false
    }
    toastSuccess("Transaction added successfully")
    await reload()
    return true
  }

  const handleUpdateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
    if (!user) return false
    const { error } = await updateTransaction(transactionId, updates)

    if (error) {
      toastError("Failed to update transaction")
      return false
    }
    toastSuccess("Transaction updated successfully")
    await reload()
    return true
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user) return false
    const { error } = await deleteTransaction(transactionId)

    if (error) {
      toastError("Failed to delete transaction")
      return false
    }
    toastSuccess("Transaction deleted successfully")
    await reload()
    return true
  }

  return {
    transactions,
    loading,
    addTransaction: handleAddTransaction,
    updateTransaction: handleUpdateTransaction,
    deleteTransaction: handleDeleteTransaction,
    refreshTransactions: reload,
  }
}
