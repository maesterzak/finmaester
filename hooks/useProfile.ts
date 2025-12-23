"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  type Category,
  getTransactions,
  getUserSettings,
  UserSettings,
} from "@/lib/firebase/firestore"
import { toastSuccess, toastError } from "@/lib/toast"

export function useProfiles() {
  const { user } = useAuth()
  const [userSettings, setUserSettings] =
  useState<UserSettings>({
    userName:  "",
    userEmail:  "",});
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadProfile()
    } else {
      setUserSettings({
  userName:  "",
  userEmail:  "",      
  userId: "",
  currency: "",
  theme: "light",
  notifications: {
    email: false,
    monthlyReports: false,
    budgetAlerts: false,
  },
})
      setLoading(false)
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    setLoading(true)
    let { data, error } = await getUserSettings(user.uid)
    
    if (error) {
      toastError("Failed to load user profile")
    } else {
    //   setUserSettings(data)
        data.userEmail  = user.email || "";
        data.userName  = user.displayName || "";
        return data;
    }

    setLoading(false)
  }



//   const handleUpdateCategory = async (categoryId: string, updates: Partial<Category>) => {
//     if (!user) return

//     const { success, error } = await updateCategory(categoryId, updates)

//     if (error) {
//       toastError("Failed to update category")
//       return false
//     } else {
//       toastSuccess("Category updated successfully")
//       await loadCategories()
//       return true
//     }
//   }



  return {
    
    loading,
    loadProfile: loadProfile,
    // updateCategory: handleUpdateCategory,
    // deleteCategory: handleDeleteCategory,
    // refreshCategories: loadCategories,
  }
}

