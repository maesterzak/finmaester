"use client"

import { useMemo, useState } from "react"
import { Plus, Wallet } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog"
import { toTransactionFields } from "@/components/transactions/transaction-fields"
import { InvestmentAccountCard } from "@/components/investments/investment-account-card"
import {
  CurrentValueDialog,
  InvestmentAccountDialog,
  TargetDialog,
  TokenDialog,
} from "@/components/investments/investment-dialogs"
import { TargetCard } from "@/components/investments/target-card"
import {
  AllocationCard,
  ContributionsChart,
  InvestmentInsights,
  PortfolioOverview,
} from "@/components/investments/portfolio-analysis"
import { ContributionsSheet, UnassignedInvestments } from "@/components/investments/contributions-sheet"
import { useTransactions } from "@/hooks/useTransactions"
import { useInvestments } from "@/hooks/useInvestments"
import type { Transaction } from "@/lib/firebase/firestore"
import type { InvestmentAccount } from "@/lib/firebase/investments"
import { monthlyContributions, summarizePortfolio, targetProgress } from "@/lib/investments"
import { toDateKey } from "@/lib/periods"

type InvestDefaults = { type: "investment"; investmentAccountId?: string; investmentTokenId?: string }

export default function InvestmentsPage() {
  const { transactions, loading: transactionsLoading, addTransaction, updateTransaction, deleteTransaction } =
    useTransactions()
  const {
    accounts,
    targets,
    loading: investmentsLoading,
    createAccount,
    updateAccount,
    deleteAccount,
    addToken,
    removeToken,
    updateTarget,
  } = useInvestments()
  const loading = transactionsLoading || investmentsLoading

  const portfolio = useMemo(() => summarizePortfolio(accounts, transactions), [accounts, transactions])
  const months = useMemo(() => monthlyContributions(transactions, targets, 12), [transactions, targets])
  const progress = useMemo(() => targetProgress(transactions, targets), [transactions, targets])

  // Dialog state
  const [accountDialog, setAccountDialog] = useState<{ open: boolean; account: InvestmentAccount | null }>({
    open: false,
    account: null,
  })
  const [tokenAccount, setTokenAccount] = useState<InvestmentAccount | null>(null)
  const [valueAccountId, setValueAccountId] = useState<string | null>(null)
  const [targetOpen, setTargetOpen] = useState(false)
  const [historyAccountId, setHistoryAccountId] = useState<string | null>(null)
  const [transactionDialog, setTransactionDialog] = useState<{
    open: boolean
    transaction: Transaction | null
    defaults?: InvestDefaults
  }>({ open: false, transaction: null })

  const valueSummary = portfolio.accounts.find((a) => a.account.id === valueAccountId) ?? null
  const historySummary = portfolio.accounts.find((a) => a.account.id === historyAccountId) ?? null

  const openInvest = (accountId?: string, tokenId?: string) =>
    setTransactionDialog({
      open: true,
      transaction: null,
      defaults: { type: "investment", investmentAccountId: accountId, investmentTokenId: tokenId },
    })

  const openEdit = (tx: Transaction) => setTransactionDialog({ open: true, transaction: tx })

  const handleAdd = async (tx: any) => {
    await addTransaction(toTransactionFields(tx))
  }

  const handleUpdate = async (tx: any) => {
    if (tx.id) await updateTransaction(tx.id, toTransactionFields(tx))
  }

  const handleDelete = async (id: string) => {
    await deleteTransaction(id)
  }

  // Links an older investment to a card by adding the card id; nothing else on it changes
  const handleAssign = (tx: Transaction, account: InvestmentAccount) =>
    updateTransaction(tx.id!, {
      investmentAccountId: account.id,
      ...(tx.assetName ? {} : { assetName: account.name }),
    })

  const handleSaveAccount = async (input: Parameters<typeof createAccount>[0]) => {
    const ok = accountDialog.account
      ? await updateAccount(accountDialog.account.id, input)
      : await createAccount(input)
    if (ok) setAccountDialog({ open: false, account: null })
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <DashboardHeader
        title="Investments"
        description="Your whole portfolio in one place"
        action={
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none gap-1.5"
              onClick={() => setAccountDialog({ open: true, account: null })}
            >
              <Plus className="h-4 w-4" /> New card
            </Button>
            <Button className="flex-1 sm:flex-none" onClick={() => openInvest()}>
              Record investment
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <PortfolioOverview portfolio={portfolio} />

          <TargetCard
            progress={progress}
            accounts={portfolio.accounts}
            onEditTarget={() => setTargetOpen(true)}
            onInvest={() => openInvest()}
          />

          {portfolio.unassigned.length > 0 && (
            <UnassignedInvestments
              transactions={portfolio.unassigned}
              total={portfolio.unassignedTotal}
              accounts={accounts}
              onAssign={handleAssign}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          )}

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Your investments</h2>
            {accounts.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center gap-3">
                  <Wallet className="h-10 w-10 text-muted-foreground/50" />
                  <div>
                    <p className="font-medium">No investment cards yet</p>
                    <p className="text-sm text-muted-foreground">
                      Create one for each place you invest, e.g. &ldquo;Cowrywise MM Fund&rdquo; or &ldquo;Crypto&rdquo;.
                    </p>
                  </div>
                  <Button onClick={() => setAccountDialog({ open: true, account: null })}>Create your first card</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {portfolio.accounts.map((summary) => (
                  <InvestmentAccountCard
                    key={summary.account.id}
                    summary={summary}
                    onInvest={openInvest}
                    onEdit={() => setAccountDialog({ open: true, account: summary.account })}
                    onDelete={() => deleteAccount(summary.account.id)}
                    onUpdateValue={() => setValueAccountId(summary.account.id)}
                    onAddToken={() => setTokenAccount(summary.account)}
                    onRemoveToken={(tokenId) => removeToken(summary.account.id, tokenId)}
                    onViewContributions={() => setHistoryAccountId(summary.account.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <ContributionsChart months={months} />
            <AllocationCard portfolio={portfolio} />
          </div>

          <InvestmentInsights portfolio={portfolio} months={months} />
        </div>
      )}

      <InvestmentAccountDialog
        open={accountDialog.open}
        onOpenChange={(open) => setAccountDialog((s) => ({ ...s, open }))}
        account={accountDialog.account}
        onSave={handleSaveAccount}
      />

      <TokenDialog
        open={!!tokenAccount}
        onOpenChange={(open) => !open && setTokenAccount(null)}
        accountName={tokenAccount?.name ?? ""}
        existingSymbols={Object.values(tokenAccount?.tokens || {}).map((t) => t.symbol)}
        onSave={async (symbol, name) => {
          if (tokenAccount && (await addToken(tokenAccount.id, symbol, name))) setTokenAccount(null)
        }}
      />

      <CurrentValueDialog
        open={!!valueSummary}
        onOpenChange={(open) => !open && setValueAccountId(null)}
        account={valueSummary?.account ?? null}
        invested={valueSummary?.invested ?? 0}
        onSave={async (value) => {
          if (!valueSummary) return
          const ok = await updateAccount(valueSummary.account.id, {
            currentValue: value,
            currentValueDate: value === null ? null : toDateKey(new Date()),
          })
          if (ok) setValueAccountId(null)
        }}
      />

      <TargetDialog
        open={targetOpen}
        onOpenChange={setTargetOpen}
        currentTarget={progress.target}
        onSave={async (monthKey, amount) => {
          if (await updateTarget(monthKey, amount)) setTargetOpen(false)
        }}
      />

      <ContributionsSheet
        summary={historySummary}
        onOpenChange={(open) => !open && setHistoryAccountId(null)}
        onEdit={openEdit}
        onDelete={handleDelete}
        onInvest={(accountId, tokenId) => {
          setHistoryAccountId(null)
          openInvest(accountId, tokenId)
        }}
      />

      <AddTransactionDialog
        open={transactionDialog.open}
        onOpenChange={(open) => setTransactionDialog((s) => ({ ...s, open }))}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        transaction={transactionDialog.transaction}
        defaults={transactionDialog.defaults}
      />
    </div>
  )
}
