"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useFinanceResource } from "@/contexts/FinanceDataContext"
import {
  type InvestmentAccount,
  type InvestmentToken,
  deleteInvestmentAccount,
  deleteInvestmentToken,
  newInvestmentId,
  saveInvestmentAccount,
  setInvestmentTarget,
} from "@/lib/firebase/investments"
import { toastError, toastSuccess } from "@/lib/toast"

export type InvestmentAccountInput = Omit<InvestmentAccount, "id" | "tokens" | "createdAt" | "updatedAt">

export function useInvestments() {
  const { user } = useAuth()
  // Shared with every other page through FinanceDataProvider
  const { data, loading, reload: load } = useFinanceResource("investments")

  const run = async (action: Promise<{ success: boolean; error: string | null }>, ok: string, fail: string) => {
    const { success } = await action
    if (success) {
      toastSuccess(ok)
      await load()
    } else {
      toastError(fail)
    }
    return success
  }

  const createAccount = async (input: InvestmentAccountInput) => {
    if (!user) return null
    const id = newInvestmentId()
    const now = new Date().toISOString()
    const ok = await run(
      saveInvestmentAccount(user.uid, id, { ...input, createdAt: now }),
      `${input.name} created`,
      "Failed to create investment card",
    )
    return ok ? id : null
  }

  const updateAccount = (accountId: string, fields: Partial<InvestmentAccountInput>) =>
    user
      ? run(saveInvestmentAccount(user.uid, accountId, fields), "Investment card updated", "Failed to update card")
      : Promise.resolve(false)

  const deleteAccount = (accountId: string) =>
    user
      ? run(deleteInvestmentAccount(user.uid, accountId), "Investment card deleted", "Failed to delete card")
      : Promise.resolve(false)

  const addToken = async (accountId: string, symbol: string, name?: string) => {
    if (!user) return null
    const token: InvestmentToken = {
      id: newInvestmentId(),
      symbol: symbol.trim().toUpperCase(),
      name: name?.trim() || null,
      createdAt: new Date().toISOString(),
    }
    const ok = await run(
      saveInvestmentAccount(user.uid, accountId, { tokens: { [token.id]: token } }),
      `${token.symbol} added`,
      "Failed to add token",
    )
    return ok ? token.id : null
  }

  const removeToken = (accountId: string, tokenId: string) =>
    user
      ? run(deleteInvestmentToken(user.uid, accountId, tokenId), "Token removed", "Failed to remove token")
      : Promise.resolve(false)

  const updateTarget = (monthKey: string, amount: number) =>
    user
      ? run(setInvestmentTarget(user.uid, monthKey, amount), "Monthly target updated", "Failed to update target")
      : Promise.resolve(false)

  return {
    accounts: data.accounts,
    targets: data.targets,
    loading,
    refresh: load,
    createAccount,
    updateAccount,
    deleteAccount,
    addToken,
    removeToken,
    updateTarget,
  }
}
