import { FieldPath, Timestamp, deleteField, doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "./config"

// Investment cards and monthly targets are stored on the user's own userSettings/{uid} document,
// which the existing security rules already allow the owner to read and write.
// Every write touches a single key (merge / field path), so nothing else on the document is replaced.

export type InvestmentType =
  | "money_market"
  | "mutual_fund"
  | "stock"
  | "crypto"
  | "fixed_income"
  | "savings"
  | "real_estate"
  | "other"

export interface InvestmentToken {
  id: string
  symbol: string
  name?: string | null
  createdAt: string
}

export interface InvestmentAccount {
  id: string
  name: string
  type: InvestmentType
  provider?: string | null
  color: string
  notes?: string | null
  // Planned contribution per month, used to split the monthly target across cards
  monthlyAllocation?: number | null
  // Manually updated market value, for gain/loss
  currentValue?: number | null
  currentValueDate?: string | null
  tokens?: Record<string, InvestmentToken>
  createdAt: string
  updatedAt: string
}

export interface InvestmentData {
  accounts: InvestmentAccount[]
  // "yyyy-MM" → target; a target applies from its month until the next entry
  targets: Record<string, number>
}

export const newInvestmentId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

const settingsRef = (userId: string) => doc(db!, "userSettings", userId)

export const getInvestmentData = async (userId: string): Promise<{ data: InvestmentData; error: string | null }> => {
  try {
    const snap = await getDoc(settingsRef(userId))
    const raw = snap.exists() ? snap.data() : {}
    const accounts = Object.values((raw.investmentAccounts || {}) as Record<string, InvestmentAccount>).sort((a, b) =>
      (a.createdAt || "").localeCompare(b.createdAt || ""),
    )
    return { data: { accounts, targets: (raw.investmentTargets || {}) as Record<string, number> }, error: null }
  } catch (error: any) {
    return { data: { accounts: [], targets: {} }, error: error.message }
  }
}

// Creates or updates one card. Only the fields passed are written.
export const saveInvestmentAccount = async (
  userId: string,
  accountId: string,
  fields: Partial<Omit<InvestmentAccount, "id" | "tokens">> & { tokens?: Record<string, InvestmentToken> },
) => {
  try {
    await setDoc(
      settingsRef(userId),
      {
        investmentAccounts: { [accountId]: { ...fields, id: accountId, updatedAt: new Date().toISOString() } },
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    )
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Removes one card. Transactions linked to it are left untouched.
export const deleteInvestmentAccount = async (userId: string, accountId: string) => {
  try {
    await updateDoc(settingsRef(userId), new FieldPath("investmentAccounts", accountId), deleteField())
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const deleteInvestmentToken = async (userId: string, accountId: string, tokenId: string) => {
  try {
    await updateDoc(settingsRef(userId), new FieldPath("investmentAccounts", accountId, "tokens", tokenId), deleteField())
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const setInvestmentTarget = async (userId: string, monthKey: string, amount: number) => {
  try {
    await setDoc(
      settingsRef(userId),
      { investmentTargets: { [monthKey]: amount }, updatedAt: Timestamp.now() },
      { merge: true },
    )
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
