import { Timestamp, doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "./config"
import { isSupportedCurrency } from "@/lib/currency"

export interface UserPreferences {
  currency: string | null
}

// Reads preferences from the user's own userSettings/{uid} document
export const getUserPreferences = async (userId: string): Promise<{ data: UserPreferences; error: string | null }> => {
  try {
    const snap = await getDoc(doc(db!, "userSettings", userId))
    const currency = snap.exists() ? snap.data().currency : null
    return { data: { currency: isSupportedCurrency(currency) ? currency : null }, error: null }
  } catch (error: any) {
    return { data: { currency: null }, error: error.message }
  }
}

// Writes only the currency field (merge), leaving the rest of the document untouched
export const setUserCurrency = async (userId: string, currency: string) => {
  try {
    await setDoc(doc(db!, "userSettings", userId), { currency, updatedAt: Timestamp.now() }, { merge: true })
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
