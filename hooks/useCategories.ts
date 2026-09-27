"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  setCategoryMonthlyBudget,
  type Category,
  getTransactions,
} from "@/lib/firebase/firestore"
import { toastSuccess, toastError } from "@/lib/toast"

export function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadCategories()
    } else {
      setCategories([])
      setLoading(false)
    }
  }, [user])

  const loadCategories = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await getCategories(user.uid)
console.log("Loaded categories:", data, "Error:", error)
    if (error) {
      toastError('Failed to load categories ')
    } else {
      setCategories(data)
    }

    setLoading(false)
  }

  const handleAddCategory = async (categoryData: Omit<Category, "id" | "userId" | "createdAt" | "updatedAt">) => {
    if (!user) return
console.log("Adding category:", categoryData)
    const { id, error } = await addCategory({
      ...categoryData,
      userId: user.uid,
    })

    if (error) {
      toastError("Failed to add category")
      return false
    } else {
      toastSuccess("Category added successfully")
      await loadCategories()
      return true
    }
  }

  const handleUpdateCategory = async (categoryId: string, updates: Partial<Category>) => {
    if (!user) return

    const { success, error } = await updateCategory(categoryId, updates)

    if (error) {
      toastError("Failed to update category")
      return false
    } else {
      toastSuccess("Category updated successfully")
      await loadCategories()
      return true
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!user) return

    const { success, error } = await deleteCategory(categoryId)

    if (error) {
      toastError("Failed to delete category")
      return false
    } else {
      toastSuccess("Category deleted successfully")
      await loadCategories()
      return true
    }
  }

  // Writes only the given month's budget for each category; returns how many succeeded
  const handleSetMonthlyBudgets = async (monthKey: string, budgets: { categoryId: string; amount: number }[]) => {
    if (!user) return 0

    const results = await Promise.all(
      budgets.map(({ categoryId, amount }) => setCategoryMonthlyBudget(categoryId, monthKey, amount)),
    )
    const succeeded = results.filter((r) => r.success).length
    if (succeeded < budgets.length) {
      toastError(`Failed to update ${budgets.length - succeeded} budget(s)`)
    }
    await loadCategories()
    return succeeded
  }

  return {
    categories,
    loading,
    addCategory: handleAddCategory,
    updateCategory: handleUpdateCategory,
    deleteCategory: handleDeleteCategory,
    setMonthlyBudgets: handleSetMonthlyBudgets,
    refreshCategories: loadCategories,
  }
}

