import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  User,
  updateProfile,
  sendEmailVerification,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth"
import { auth } from "./config"

// Helper to check if auth is available
const checkAuth = () => {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized. Please check your Firebase configuration.")
  }
  return auth
}

// Email/Password Authentication
export const signInWithEmail = async (email: string, password: string) => {
  try {
    if (!email || !password) {
      return { user: null, error: "Email and password are required" }
    }
    const authInstance = checkAuth()
    const userCredential = await signInWithEmailAndPassword(authInstance, email, password)
    return { user: userCredential.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message || "An error occurred during sign in" }
  }
}

export const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
  try {
    if (!email || !password) {
      return { user: null, error: "Email and password are required" }
    }
    const authInstance = checkAuth()
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password)
    const user = userCredential.user

    // Update display name if provided
    if (displayName) {
      await updateProfile(user, { displayName })
    }

    // Send email verification
    await sendEmailVerification(user)

    return { user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message || "An error occurred during sign up" }
  }
}

// Google Authentication
export const signInWithGoogle = async () => {
  try {
    const authInstance = checkAuth()
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(authInstance, provider)
    return { user: userCredential.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message || "An error occurred during Google sign in" }
  }
}

// Phone Authentication
export const sendPhoneVerificationCode = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
  try {
    if (!phoneNumber) {
      return { confirmationResult: null, error: "Phone number is required" }
    }
    const authInstance = checkAuth()
    const confirmationResult = await signInWithPhoneNumber(authInstance, phoneNumber, recaptchaVerifier)
    return { confirmationResult, error: null }
  } catch (error: any) {
    return { confirmationResult: null, error: error.message || "An error occurred during phone verification" }
  }
}

export const verifyPhoneCode = async (confirmationResult: any, code: string) => {
  try {
    const userCredential = await confirmationResult.confirm(code)
    return { user: userCredential.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Password Reset
export const resetPassword = async (email: string) => {
  try {
    if (!email) {
      return { success: false, error: "Email is required" }
    }
    const authInstance = checkAuth()
    await sendPasswordResetEmail(authInstance, email)
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message || "An error occurred during password reset" }
  }
}

// Sign Out
export const logout = async () => {
  try {
    const authInstance = checkAuth()
    await signOut(authInstance)
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message || "An error occurred during sign out" }
  }
}

// Get current user
export const getCurrentUser = (): User | null => {
  if (!auth) return null
  return auth.currentUser
}

// Create Recaptcha Verifier
export const createRecaptchaVerifier = (elementId: string) => {
  if (typeof window !== "undefined" && auth) {
    try {
      return new RecaptchaVerifier(auth, elementId, {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
      })
    } catch (error) {
      console.error("Error creating reCAPTCHA verifier:", error)
      return null
    }
  }
  return null
}

