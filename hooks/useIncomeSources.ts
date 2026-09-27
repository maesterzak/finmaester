"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  getIncomeSources,
  addIncomeSource,
  updateIncomeSource,
  deleteIncomeSource,
  type IncomeSource,
} from "@/lib/firebase/firestore"
import { toastSuccess, toastError } from "@/lib/toast"

export function useIncomeSources() {
  const { user } = useAuth()
  const [sources, setSources] = useState<IncomeSource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadIncomeSources()
    } else {
      setSources([])
      setLoading(false)
    }
  }, [user])

  const loadIncomeSources = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await getIncomeSources(user.uid)
    if (error) {
      toastError("Failed to load income sources")
    } else {
      setSources(data)
    }
    setLoading(false)
  }

  const handleAddSource = async (sourceData: Omit<IncomeSource, "id" | "userId" | "createdAt" | "updatedAt">) => {
    if (!user) return false
    const { id, error } = await addIncomeSource({
      ...sourceData,
      userId: user.uid,
    })

    if (error) {
      toastError("Failed to add income source")
      return false
    } else {
      toastSuccess("Income source added successfully")
      await loadIncomeSources()
      return true
    }
  }

  const handleUpdateSource = async (sourceId: string, updates: Partial<IncomeSource>) => {
    if (!user) return false
    const { success, error } = await updateIncomeSource(sourceId, updates)

    if (error) {
      toastError("Failed to update income source")
      return false
    } else {
      toastSuccess("Income source updated successfully")
      await loadIncomeSources()
      return true
    }
  }

  const handleDeleteSource = async (sourceId: string) => {
    if (!user) return false
    const { success, error } = await deleteIncomeSource(sourceId)

    if (error) {
      toastError("Failed to delete income source")
      return false
    } else {
      toastSuccess("Income source deleted successfully")
      await loadIncomeSources()
      return true
    }
  }

  return {
    sources,
    loading,
    addSource: handleAddSource,
    updateSource: handleUpdateSource,
    deleteSource: handleDeleteSource,
    refreshSources: loadIncomeSources,
  }
}
