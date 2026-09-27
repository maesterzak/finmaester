"use client"

import { useState } from "react"
import { Coins, List, MoreHorizontal, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { type AccountSummary, formatInvestmentDate, investmentTypeLabel } from "@/lib/investments"
import { formatCurrency } from "@/lib/formatCurrency"
import { cn } from "@/lib/utils"

const formatUnits = (units: number) =>
  units.toLocaleString(undefined, { maximumFractionDigits: units < 1 ? 8 : 4 })

interface InvestmentAccountCardProps {
  summary: AccountSummary
  onInvest: (accountId: string, tokenId?: string) => void
  onEdit: () => void
  onDelete: () => void
  onUpdateValue: () => void
  onAddToken: () => void
  onRemoveToken: (tokenId: string) => void
  onViewContributions: () => void
}

export function InvestmentAccountCard({
  summary,
  onInvest,
  onEdit,
  onDelete,
  onUpdateValue,
  onAddToken,
  onRemoveToken,
  onViewContributions,
}: InvestmentAccountCardProps) {
  const { account, invested, currentValue, gain, gainPct, thisMonth, count, lastDate, share, tokens } = summary
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isCrypto = account.type === "crypto"
  const plan = account.monthlyAllocation ?? 0

  return (
    <Card className="overflow-hidden border-border/50 flex flex-col min-w-0">
      <div className="h-1" style={{ backgroundColor: account.color }} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl shrink-0" style={{ backgroundColor: `${account.color}20` }}>
              <Coins className="h-5 w-5" style={{ color: account.color }} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-semibold truncate">{account.name}</CardTitle>
              <p className="text-xs text-muted-foreground truncate">
                {investmentTypeLabel(account.type)}
                {account.provider && ` · ${account.provider}`}
              </p>
            </div>
          </div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions for {account.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onViewContributions}>
                <List className="mr-2 h-4 w-4" /> View contributions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onUpdateValue}>
                <RefreshCw className="mr-2 h-4 w-4" /> Update current value
              </DropdownMenuItem>
              {isCrypto && (
                <DropdownMenuItem onClick={onAddToken}>
                  <Plus className="mr-2 h-4 w-4" /> Add token
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" /> Edit card
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete card
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col">
        <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Total invested</p>
            <p className="text-2xl font-bold truncate">{formatCurrency(invested)}</p>
          </div>
          <p className="text-xs text-muted-foreground pb-1">{share.toFixed(0)}% of portfolio</p>
        </div>

        {currentValue !== null ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 p-2.5 text-sm">
            <span className="text-muted-foreground">
              Worth <span className="font-semibold text-foreground">{formatCurrency(currentValue)}</span>
            </span>
            {gain !== null && (
              <span className={cn("font-semibold", gain >= 0 ? "text-emerald-500" : "text-red-500")}>
                {gain >= 0 ? "+" : "-"}
                {formatCurrency(Math.abs(gain))}
                {gainPct !== null && ` (${gain >= 0 ? "+" : ""}${gainPct.toFixed(1)}%)`}
              </span>
            )}
            {account.currentValueDate && (
              <span className="w-full text-xs text-muted-foreground">
                Value as of {formatInvestmentDate(account.currentValueDate)}
              </span>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onUpdateValue}
            className="w-full rounded-lg border border-dashed p-2.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors text-left"
          >
            + Add its current value to track gains
          </button>
        )}

        <div className="grid grid-cols-3 gap-2 text-center">
          <MiniStat label="This month" value={formatCurrency(thisMonth)} hint={plan > 0 ? `of ${formatCurrency(plan)}` : undefined} />
          <MiniStat label="Deposits" value={String(count)} />
          <MiniStat label="Last" value={lastDate ? formatInvestmentDate(lastDate).replace(/ \d{4}$/, "") : "—"} />
        </div>

        {isCrypto && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Tokens</p>
              <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={onAddToken}>
                <Plus className="h-3.5 w-3.5" /> Add token
              </Button>
            </div>
            {tokens.length === 0 ? (
              <p className="text-xs text-muted-foreground rounded-lg bg-muted/40 p-2.5">
                Add the tokens you buy (BTC, ETH, USDT…) to see each one here.
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-lg border">
                {tokens.map((token) => (
                  <li key={token.id} className="flex items-center gap-2 py-2 pl-3 pr-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {token.symbol}
                        {token.name && <span className="font-normal text-muted-foreground"> · {token.name}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {token.units > 0 ? `${formatUnits(token.units)} ${token.symbol}` : `${token.count} buy${token.count !== 1 ? "s" : ""}`}
                        {token.averagePrice !== null && ` · avg ${formatCurrency(token.averagePrice)}`}
                      </p>
                    </div>
                    <span className="text-sm font-semibold whitespace-nowrap">{formatCurrency(token.invested)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-primary"
                      onClick={() => onInvest(account.id, token.id)}
                    >
                      Buy
                    </Button>
                    {token.count === 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground"
                        onClick={() => onRemoveToken(token.id)}
                        aria-label={`Remove ${token.symbol}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {summary.untokenedInvested > 0 && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(summary.untokenedInvested)} not linked to a token. Edit those contributions to pick one.
              </p>
            )}
          </div>
        )}

        <div className="mt-auto flex gap-2 pt-1">
          <Button onClick={() => onInvest(account.id)} className="flex-1">
            Invest
          </Button>
          <Button variant="outline" onClick={onViewContributions} className="flex-1">
            History
          </Button>
        </div>
      </CardContent>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {account.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The card will be removed.{" "}
              {count > 0
                ? `Your ${count} contribution${count !== 1 ? "s" : ""} (${formatCurrency(invested)}) are kept and will show as unassigned so you can link them to another card.`
                : "It has no contributions."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onDelete}
            >
              Delete card
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

function MiniStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-2 min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium truncate">{label}</p>
      <p className="text-xs sm:text-sm font-semibold mt-0.5 truncate">{value}</p>
      {hint && <p className="text-[10px] text-muted-foreground truncate">{hint}</p>}
    </div>
  )
}
