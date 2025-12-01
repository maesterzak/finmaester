"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { User, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase/config"
import { signInWithEmail, signUpWithEmail, signInWithGoogle, logout, resetPassword } from "@/lib/firebase/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>
  signInWithGoogleProvider: () => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPasswordEmail: (email: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { user, error } = await signInWithEmail(email, password)
      if (error) {
        return { success: false, error }
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const { user, error } = await signUpWithEmail(email, password, displayName)
      if (error) {
        return { success: false, error }
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const signInWithGoogleProvider = async () => {
    try {
      const { user, error } = await signInWithGoogle()
      if (error) {
        return { success: false, error }
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const resetPasswordEmail = async (email: string) => {
    try {
      const { success, error } = await resetPassword(email)
      if (error) {
        return { success: false, error }
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogleProvider,
    signOut,
    resetPasswordEmail,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

