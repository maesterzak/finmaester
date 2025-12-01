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
import { toastSuccess, toastError } from "@/lib/toast"

export function useTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadTransactions()
    } else {
      setTransactions([])
      setLoading(false)
    }
  }, [user])

  const loadTransactions = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await getTransactions(user.uid)
    if (error) {
      toastError("Failed to load transactions")
    } else {
      setTransactions(data)
    }
    setLoading(false)
  }

  const handleAddTransaction = async (transactionData: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt">) => {
    console.log("Adding transaction 2", transactionData)
    if (!user) return
    console.log("Adding transaction", transactionData)
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
    if (!user) return

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
    if (!user) return

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

