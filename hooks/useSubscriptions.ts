"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  getSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  type Subscription,
} from "@/lib/firebase/firestore"
import { toastSuccess, toastError } from "@/lib/toast"

export function useSubscriptions() {
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadSubscriptions()
    } else {
      setSubscriptions([])
      setLoading(false)
    }
  }, [user])

  const loadSubscriptions = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await getSubscriptions(user.uid)
    if (error) {
      toastError("Failed to load subscriptions")
    } else {
      // Calculate days until renewal dynamically
      const updated = data.map((sub) => {
        const renewal = new Date(sub.renewalDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const diffTime = renewal.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return {
          ...sub,
          daysUntilRenewal: diffDays,
        }
      })
      setSubscriptions(updated)
    }
    setLoading(false)
  }

  const handleAddSubscription = async (subData: Omit<Subscription, "id" | "userId" | "createdAt" | "updatedAt">) => {
    if (!user) return false
    const { id, error } = await addSubscription({
      ...subData,
      userId: user.uid,
    })

    if (error) {
      toastError("Failed to add subscription")
      return false
    } else {
      toastSuccess("Subscription added successfully")
      await loadSubscriptions()
      return true
    }
  }

  const handleUpdateSubscription = async (subscriptionId: string, updates: Partial<Subscription>) => {
    if (!user) return false
    const { success, error } = await updateSubscription(subscriptionId, updates)

    if (error) {
      toastError("Failed to update subscription")
      return false
    } else {
      toastSuccess("Subscription updated successfully")
      await loadSubscriptions()
      return true
    }
  }

  const handleDeleteSubscription = async (subscriptionId: string) => {
    if (!user) return false
    const { success, error } = await deleteSubscription(subscriptionId)

    if (error) {
      toastError("Failed to remove subscription")
      return false
    } else {
      toastSuccess("Subscription removed successfully")
      await loadSubscriptions()
      return true
    }
  }

  return {
    subscriptions,
    loading,
    addSubscription: handleAddSubscription,
    updateSubscription: handleUpdateSubscription,
    deleteSubscription: handleDeleteSubscription,
    refreshSubscriptions: loadSubscriptions,
  }
}
