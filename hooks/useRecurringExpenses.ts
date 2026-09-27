"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  getRecurringExpenses,
  addRecurringExpense,
  deleteRecurringExpense,
  type RecurringExpense,
} from "@/lib/firebase/firestore"
import { toastSuccess, toastError } from "@/lib/toast"

export function useRecurringExpenses() {
  const { user } = useAuth()
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadRecurringExpenses()
    } else {
      setRecurringExpenses([])
      setLoading(false)
    }
  }, [user])

  const loadRecurringExpenses = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await getRecurringExpenses(user.uid)
    if (error) {
      toastError("Failed to load recurring expenses")
    } else {
      // Calculate days until due dynamically
      const updated = data.map((exp) => {
        const nextDue = new Date(exp.nextDue)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const diffTime = nextDue.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return {
          ...exp,
          daysUntilDue: diffDays,
        }
      })
      setRecurringExpenses(updated)
    }
    setLoading(false)
  }

  const handleAddRecurringExpense = async (expenseData: Omit<RecurringExpense, "id" | "userId" | "createdAt" | "updatedAt">) => {
    if (!user) return false
    const { id, error } = await addRecurringExpense({
      ...expenseData,
      userId: user.uid,
    })

    if (error) {
      toastError("Failed to add recurring expense")
      return false
    } else {
      toastSuccess("Recurring expense added successfully")
      await loadRecurringExpenses()
      return true
    }
  }

  const handleDeleteRecurringExpense = async (expenseId: string) => {
    if (!user) return false
    const { success, error } = await deleteRecurringExpense(expenseId)

    if (error) {
      toastError("Failed to delete recurring expense")
      return false
    } else {
      toastSuccess("Recurring expense deleted successfully")
      await loadRecurringExpenses()
      return true
    }
  }

  return {
    recurringExpenses,
    loading,
    addRecurringExpense: handleAddRecurringExpense,
    deleteRecurringExpense: handleDeleteRecurringExpense,
    refreshRecurringExpenses: loadRecurringExpenses,
  }
}
