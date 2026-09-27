"use client"

import type React from "react"
import { Fragment, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { type Category, type Transaction, getCategoryDocs, getTransactions } from "@/lib/firebase/firestore"
import { type InvestmentData, getInvestmentData } from "@/lib/firebase/investments"
import { type UserPreferences, getUserPreferences, setUserCurrency } from "@/lib/firebase/preferences"
import { guessCurrencyFromLocale } from "@/lib/currency"
import { setActiveCurrency } from "@/lib/formatCurrency"
import { toastError } from "@/lib/toast"

// One shared copy of the signed-in user's data for every dashboard page and widget.
// Before this, each widget fetched every transaction on its own (up to 7 times per page load).

interface Resource<T> {
  data: T
  loading: boolean
  // Components call request() when they mount; data is fetched once, on first request
  request: () => void
  reload: () => Promise<void>
}

interface FinanceData {
  transactions: Resource<Transaction[]>
  categories: Resource<Category[]>
  investments: Resource<InvestmentData>
}

const FinanceDataContext = createContext<FinanceData | null>(null)

function useLazyResource<T>(
  uid: string | undefined,
  initial: T,
  loader: (uid: string) => Promise<{ data: T; error: string | null }>,
  errorMessage: string,
): Resource<T> {
  const [data, setData] = useState<T>(initial)
  const [loading, setLoading] = useState(true)
  const [requested, setRequested] = useState(false)
  const latestUid = useRef(uid)
  latestUid.current = uid

  const reload = useCallback(async () => {
    if (!uid) return
    const result = await loader(uid)
    // Ignore responses for a user who has since signed out
    if (latestUid.current !== uid) return
    if (result.error) toastError(errorMessage)
    else setData(result.data)
    setLoading(false)
    // loader and errorMessage are module-level constants
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  // Reset only when the signed-in user actually changes. This must not run on mount: child effects run
  // before this one, so resetting here would cancel the request() calls the widgets just made.
  const previousUid = useRef(uid)
  useEffect(() => {
    if (!uid) setLoading(false)
    if (previousUid.current === uid) return
    previousUid.current = uid
    setData(initial)
    setLoading(!!uid)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  useEffect(() => {
    if (requested && uid) reload()
  }, [requested, uid, reload])

  const request = useCallback(() => setRequested(true), [])

  return useMemo(() => ({ data, loading, request, reload }), [data, loading, request, reload])
}

const EMPTY_TRANSACTIONS: Transaction[] = []
const EMPTY_CATEGORIES: Category[] = []
const EMPTY_INVESTMENTS: InvestmentData = { accounts: [], targets: {} }
const EMPTY_PREFERENCES: UserPreferences = { currency: null }

// Before currencies were selectable every amount was recorded in Naira
const LEGACY_CURRENCY = "NGN"

interface CurrencyContextValue {
  currency: string
  // Relabels amounts in the new currency; stored numbers are not converted
  setCurrency: (code: string) => Promise<boolean>
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

// Adds per-month expense totals to each category (what getCategories used to do with a second fetch)
function withMonthlySpending(categories: Category[], transactions: Transaction[]): Category[] {
  const grouped: Record<string, Record<string, { spent: number; transactions: number }>> = {}
  transactions.forEach((tx) => {
    if (tx.type !== "expense" || !tx.categoryId || !tx.date) return
    const month = tx.date.slice(0, 7)
    const byMonth = grouped[tx.categoryId] || (grouped[tx.categoryId] = {})
    const entry = byMonth[month] || (byMonth[month] = { spent: 0, transactions: 0 })
    entry.spent += Number(tx.amount) || 0
    entry.transactions += 1
  })
  return categories.map((c) => ({ ...c, monthlySpending: (c.id && grouped[c.id]) || {} }))
}

export function FinanceDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid

  const transactions = useLazyResource(
    uid,
    EMPTY_TRANSACTIONS,
    (id) => getTransactions(id),
    "Failed to load transactions",
  )
  const rawCategories = useLazyResource(uid, EMPTY_CATEGORIES, getCategoryDocs, "Failed to load categories")
  const investments = useLazyResource(uid, EMPTY_INVESTMENTS, getInvestmentData, "Failed to load investments")

  const categoriesData = useMemo(
    () => withMonthlySpending(rawCategories.data, transactions.data),
    [rawCategories.data, transactions.data],
  )

  const { request: requestTransactions } = transactions
  const { request: requestRawCategories } = rawCategories
  const requestCategories = useCallback(() => {
    // Category spending needs transactions too
    requestRawCategories()
    requestTransactions()
  }, [requestRawCategories, requestTransactions])

  const categories = useMemo<Resource<Category[]>>(
    () => ({
      data: categoriesData,
      loading: rawCategories.loading || transactions.loading,
      request: requestCategories,
      reload: rawCategories.reload,
    }),
    [categoriesData, rawCategories.loading, transactions.loading, requestCategories, rawCategories.reload],
  )

  const value = useMemo(() => ({ transactions, categories, investments }), [transactions, categories, investments])

  // ---------- Currency ----------
  const preferences = useLazyResource(uid, EMPTY_PREFERENCES, getUserPreferences, "Failed to load your settings")
  const { request: requestPreferences } = preferences
  useEffect(() => requestPreferences(), [requestPreferences])

  // No saved currency: existing records mean an older account (always Naira), otherwise guess from the browser
  const needsDefault = !preferences.loading && !preferences.data.currency
  useEffect(() => {
    if (needsDefault) requestTransactions()
  }, [needsDefault, requestTransactions])

  const currency =
    preferences.data.currency ??
    (needsDefault && !transactions.loading
      ? transactions.data.length > 0
        ? LEGACY_CURRENCY
        : guessCurrencyFromLocale()
      : null)

  // Save the default once so it can't change under the user later
  useEffect(() => {
    if (uid && needsDefault && currency) setUserCurrency(uid, currency)
  }, [uid, needsDefault, currency])

  const { reload: reloadPreferences } = preferences
  const setCurrency = useCallback(
    async (code: string) => {
      if (!uid) return false
      const { success } = await setUserCurrency(uid, code)
      if (!success) {
        toastError("Couldn't change your currency")
        return false
      }
      await reloadPreferences()
      return true
    },
    [uid, reloadPreferences],
  )

  const currencyValue = useMemo(() => (currency ? { currency, setCurrency } : null), [currency, setCurrency])

  if (!currencyValue) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    )
  }

  // Formatting helpers read the active currency; keying the tree re-renders everything when it changes
  setActiveCurrency(currencyValue.currency)

  return (
    <FinanceDataContext.Provider value={value}>
      <CurrencyContext.Provider value={currencyValue}>
        <Fragment key={currencyValue.currency}>{children}</Fragment>
      </CurrencyContext.Provider>
    </FinanceDataContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) throw new Error("useCurrency must be used inside FinanceDataProvider")
  return context
}

export function useFinanceResource<K extends keyof FinanceData>(key: K): FinanceData[K] {
  const context = useContext(FinanceDataContext)
  if (!context) throw new Error(`useFinanceResource("${key}") must be used inside FinanceDataProvider`)
  const resource = context[key]
  const { request } = resource
  useEffect(() => {
    request()
  }, [request])
  return resource
}
