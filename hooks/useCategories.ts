"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useFinanceResource } from "@/contexts/FinanceDataContext"
import {
  addCategory,
  updateCategory,
  deleteCategory,
  setCategoryMonthlyBudget,
  type Category,
} from "@/lib/firebase/firestore"
import { toastSuccess, toastError } from "@/lib/toast"

// Reads from the shared FinanceDataProvider; monthly spending is computed from the shared transactions
export function useCategories() {
  const { user } = useAuth()
  const { data: categories, loading, reload } = useFinanceResource("categories")

  const handleAddCategory = async (categoryData: Omit<Category, "id" | "userId" | "createdAt" | "updatedAt">) => {
    if (!user) return false
    const { error } = await addCategory({
      ...categoryData,
      userId: user.uid,
    })

    if (error) {
      toastError("Failed to add category")
      return false
    }
    toastSuccess("Category added successfully")
    await reload()
    return true
  }

  const handleUpdateCategory = async (categoryId: string, updates: Partial<Category>) => {
    if (!user) return false
    const { error } = await updateCategory(categoryId, updates)

    if (error) {
      toastError("Failed to update category")
      return false
    }
    toastSuccess("Category updated successfully")
    await reload()
    return true
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!user) return false
    const { error } = await deleteCategory(categoryId)

    if (error) {
      toastError("Failed to delete category")
      return false
    }
    toastSuccess("Category deleted successfully")
    await reload()
    return true
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
    await reload()
    return succeeded
  }

  return {
    categories,
    loading,
    addCategory: handleAddCategory,
    updateCategory: handleUpdateCategory,
    deleteCategory: handleDeleteCategory,
    setMonthlyBudgets: handleSetMonthlyBudgets,
    refreshCategories: reload,
  }
}
