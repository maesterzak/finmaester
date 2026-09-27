"use client"

import { useMemo, useState } from "react"
import { FolderOpen, Link2 } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TransactionActions } from "@/components/transactions/transaction-actions"
import type { Transaction } from "@/lib/firebase/firestore"
import type { InvestmentAccount } from "@/lib/firebase/investments"
import { type AccountSummary, formatInvestmentDate } from "@/lib/investments"
import { formatCurrency } from "@/lib/formatCurrency"
import { cn } from "@/lib/utils"

const byDateDesc = (a: Transaction, b: Transaction) => (b.date || "").localeCompare(a.date || "")

function ContributionRow({
  tx,
  tokenLabel,
  onEdit,
  onDelete,
}: {
  tx: Transaction
  tokenLabel?: string
  onEdit: (tx: Transaction) => void
  onDelete: (id: string) => void
}) {
  return (
    <li className="flex items-center gap-3 py-2.5 pl-3 pr-1">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium break-words">{tx.description || "Investment"}</p>
        <p className="text-xs text-muted-foreground truncate">
          {formatInvestmentDate(tx.date)}
          {tokenLabel && ` · ${tokenLabel}`}
          {tx.units ? ` · ${Number(tx.units).toLocaleString(undefined, { maximumFractionDigits: 8 })} units` : ""}
        </p>
      </div>
      <span className="text-sm font-semibold text-blue-500 whitespace-nowrap">
        {formatCurrency(Number(tx.amount) || 0)}
      </span>
      <TransactionActions transaction={tx} onEdit={onEdit} onDelete={onDelete} />
    </li>
  )
}

// ---------- Card history ----------

export function ContributionsSheet({
  summary,
  onOpenChange,
  onEdit,
  onDelete,
  onInvest,
}: {
  summary: AccountSummary | null
  onOpenChange: (open: boolean) => void
  onEdit: (tx: Transaction) => void
  onDelete: (id: string) => void
  onInvest: (accountId: string, tokenId?: string) => void
}) {
  const [tokenFilter, setTokenFilter] = useState("all")
  const account = summary?.account

  const tokenNames = useMemo(
    () => new Map(Object.values(account?.tokens || {}).map((t) => [t.id, t.symbol])),
    [account],
  )

  const list = useMemo(() => {
    if (!summary) return []
    const txs = [...summary.transactions].sort(byDateDesc)
    if (tokenFilter === "all") return txs
    if (tokenFilter === "none") return txs.filter((t) => !t.investmentTokenId || !tokenNames.has(t.investmentTokenId))
    return txs.filter((t) => t.investmentTokenId === tokenFilter)
  }, [summary, tokenFilter, tokenNames])

  const listTotal = list.reduce((s, t) => s + (Number(t.amount) || 0), 0)

  return (
    <Sheet
      open={!!summary}
      onOpenChange={(open) => {
        if (!open) setTokenFilter("all")
        onOpenChange(open)
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        {summary && account && (
          <>
            <div className="h-1" style={{ backgroundColor: account.color }} />
            <div className="p-4 sm:p-6 space-y-5">
              <SheetHeader className="text-left">
                <SheetTitle>{account.name}</SheetTitle>
                <SheetDescription>
                  {summary.count} contribution{summary.count !== 1 ? "s" : ""} · {formatCurrency(summary.invested)} invested
                </SheetDescription>
              </SheetHeader>

              {tokenNames.size > 0 && (
                <Select value={tokenFilter} onValueChange={setTokenFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tokens</SelectItem>
                    {summary.tokens.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.symbol} · {formatCurrency(t.invested)}
                      </SelectItem>
                    ))}
                    {summary.untokenedInvested > 0 && <SelectItem value="none">Not linked to a token</SelectItem>}
                  </SelectContent>
                </Select>
              )}

              {list.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center rounded-lg border border-dashed">
                  <FolderOpen className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No contributions yet</p>
                </div>
              ) : (
                <>
                  {tokenFilter !== "all" && (
                    <p className="text-sm text-muted-foreground">
                      {list.length} contribution{list.length !== 1 ? "s" : ""} ·{" "}
                      <span className="font-semibold text-foreground">{formatCurrency(listTotal)}</span>
                    </p>
                  )}
                  <ul className="divide-y divide-border rounded-lg border">
                    {list.map((tx) => (
                      <ContributionRow
                        key={tx.id}
                        tx={tx}
                        tokenLabel={tx.investmentTokenId ? tokenNames.get(tx.investmentTokenId) : undefined}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    ))}
                  </ul>
                </>
              )}

              <Button
                className="w-full"
                onClick={() => onInvest(account.id, tokenFilter !== "all" && tokenFilter !== "none" ? tokenFilter : undefined)}
              >
                Invest in {account.name}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ---------- Unassigned (older) investments ----------

export function UnassignedInvestments({
  transactions,
  total,
  accounts,
  onAssign,
  onEdit,
  onDelete,
}: {
  transactions: Transaction[]
  total: number
  accounts: InvestmentAccount[]
  onAssign: (tx: Transaction, account: InvestmentAccount) => Promise<unknown>
  onEdit: (tx: Transaction) => void
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [assigning, setAssigning] = useState<string | null>(null)
  const sorted = useMemo(() => [...transactions].sort(byDateDesc), [transactions])
  const visible = expanded ? sorted : sorted.slice(0, 5)

  const assign = async (tx: Transaction, accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    if (!account || !tx.id) return
    setAssigning(tx.id)
    await onAssign(tx, account)
    setAssigning(null)
  }

  return (
    <Card className="border-amber-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Link2 className="h-5 w-5 text-amber-500" /> Link your earlier investments
        </CardTitle>
        <CardDescription>
          {transactions.length} investment{transactions.length !== 1 ? "s" : ""} ({formatCurrency(total)}) aren&apos;t
          linked to a card yet. They count in your totals; link them to see them on the right card.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="divide-y divide-border rounded-lg border">
          {visible.map((tx) => (
            <li key={tx.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium break-words">
                  {tx.assetName || tx.description || "Investment"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {formatInvestmentDate(tx.date)}
                  {tx.assetName && tx.description ? ` · ${tx.description}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-500 whitespace-nowrap">
                  {formatCurrency(Number(tx.amount) || 0)}
                </span>
                {accounts.length > 0 && (
                  <Select onValueChange={(v) => assign(tx, v)} disabled={assigning === tx.id}>
                    <SelectTrigger className={cn("h-9 w-full sm:w-[170px]", assigning === tx.id && "opacity-60")}>
                      <SelectValue placeholder="Link to card…" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <TransactionActions transaction={tx} onEdit={onEdit} onDelete={onDelete} />
              </div>
            </li>
          ))}
        </ul>
        {sorted.length > 5 && (
          <Button variant="ghost" size="sm" onClick={() => setExpanded((e) => !e)}>
            {expanded ? "Show fewer" : `Show all ${sorted.length}`}
          </Button>
        )}
        {accounts.length === 0 && (
          <p className="text-xs text-muted-foreground">Create an investment card first, then link these to it.</p>
        )}
      </CardContent>
    </Card>
  )
}
