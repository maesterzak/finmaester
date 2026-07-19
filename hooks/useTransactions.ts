"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  type Transaction,
} from "@/lib/firebase/firestore"
import { where, limit, QueryConstraint } from "firebase/firestore"
import { toastSuccess, toastError } from "@/lib/toast"

interface UseTransactionsOptions {
  limitCount?: number
  startDate?: string
  endDate?: string
}

export function useTransactions(options?: UseTransactionsOptions) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const optionKey = JSON.stringify(options)

  useEffect(() => {
    if (user) {
      loadTransactions()
    } else {
      setTransactions([])
      setLoading(false)
    }
  }, [user, optionKey])

  const loadTransactions = async () => {
    if (!user) return

    setLoading(true)
    const constraints: QueryConstraint[] = []
    
    if (options?.startDate) {
      constraints.push(where("date", ">=", options.startDate))
    }
    if (options?.endDate) {
      constraints.push(where("date", "<=", options.endDate))
    }
    if (options?.limitCount) {
      constraints.push(limit(options.limitCount))
    }

    const { data, error } = await getTransactions(user.uid, constraints)
    if (error) {
      toastError("Failed to load transactions")
    } else {
      setTransactions(data)
    }
    setLoading(false)
  }

  const handleAddTransaction = async (transactionData: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt">) => {
    if (!user) return false
    const { id, error } = await addTransaction({
      ...transactionData,
      userId: user.uid,
    })

    if (error) {
      toastError("Failed to add transaction")
      return false
    } else {
      toastSuccess("Transaction added successfully")
      await loadTransactions()
      return true
    }
  }

  const handleUpdateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
    if (!user) return false
    const { success, error } = await updateTransaction(transactionId, updates)

    if (error) {
      toastError("Failed to update transaction")
      return false
    } else {
      toastSuccess("Transaction updated successfully")
      await loadTransactions()
      return true
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user) return false
    const { success, error } = await deleteTransaction(transactionId)

    if (error) {
      toastError("Failed to delete transaction")
      return false
    } else {
      toastSuccess("Transaction deleted successfully")
      await loadTransactions()
      return true
    }
  }

  return {
    transactions,
    loading,
    addTransaction: handleAddTransaction,
    updateTransaction: handleUpdateTransaction,
    deleteTransaction: handleDeleteTransaction,
    refreshTransactions: loadTransactions,
  }
}
