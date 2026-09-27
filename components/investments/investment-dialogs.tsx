"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { InvestmentAccountInput } from "@/hooks/useInvestments"
import type { InvestmentAccount, InvestmentType } from "@/lib/firebase/investments"
import { INVESTMENT_COLORS, INVESTMENT_TYPES } from "@/lib/investments"
import { currencySymbol, formatCurrency, symbolInputPadding } from "@/lib/formatCurrency"
import { monthKeyOf } from "@/lib/periods"
import { cn } from "@/lib/utils"

const dialogClass = "max-w-md w-[calc(100%-2rem)] max-h-[90dvh] overflow-y-auto p-4 sm:p-6"

const parseAmount = (value: string) => {
  const n = Number.parseFloat(value.replace(/,/g, ""))
  return Number.isFinite(n) ? n : null
}

function MoneyInput({
  id,
  value,
  onChange,
  placeholder = "0",
  invalid,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  invalid?: boolean
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currencySymbol()}</span>
      <Input
        id={id}
        type="number"
        step="any"
        min="0"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={symbolInputPadding()}
        className={cn(invalid && "border-destructive")}
      />
    </div>
  )
}

// ---------- Create / edit investment card ----------

export function InvestmentAccountDialog({
  open,
  onOpenChange,
  account,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: InvestmentAccount | null
  onSave: (input: InvestmentAccountInput) => Promise<unknown>
}) {
  const [name, setName] = useState("")
  const [type, setType] = useState<InvestmentType>("money_market")
  const [provider, setProvider] = useState("")
  const [color, setColor] = useState(INVESTMENT_COLORS[0])
  const [allocation, setAllocation] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(account?.name ?? "")
    setType(account?.type ?? "money_market")
    setProvider(account?.provider ?? "")
    setColor(account?.color ?? INVESTMENT_COLORS[Math.floor(Math.random() * INVESTMENT_COLORS.length)])
    setAllocation(account?.monthlyAllocation ? String(account.monthlyAllocation) : "")
    setNotes(account?.notes ?? "")
    setError(null)
  }, [open, account])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Give this investment a name")
      return
    }
    setSaving(true)
    await onSave({
      name: name.trim(),
      type,
      provider: provider.trim() || null,
      color,
      monthlyAllocation: parseAmount(allocation) || null,
      notes: notes.trim() || null,
    })
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClass}>
        <DialogHeader>
          <DialogTitle>{account ? "Edit investment" : "New investment card"}</DialogTitle>
          <DialogDescription>
            {account
              ? "Update this investment's details."
              : "Create a card for each place you invest, e.g. Cowrywise MM Fund or Crypto."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="inv-name">Name</Label>
            <Input
              id="inv-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cowrywise MM Fund"
              className={cn(error && "border-destructive")}
            />
            {error && <span className="text-xs text-destructive">{error}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="inv-type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as InvestmentType)}>
                <SelectTrigger id="inv-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVESTMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inv-provider">Platform (optional)</Label>
              <Input
                id="inv-provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="e.g. Cowrywise, Binance"
              />
            </div>
          </div>

          {type === "crypto" && (
            <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 p-3">
              After creating this card, add the tokens you buy (BTC, ETH, SOL…) from the card. Each purchase can then be
              linked to a token.
            </p>
          )}

          <div className="grid gap-2">
            <Label htmlFor="inv-allocation">Monthly plan (optional)</Label>
            <MoneyInput id="inv-allocation" value={allocation} onChange={setAllocation} placeholder="e.g. 300000" />
            <span className="text-xs text-muted-foreground">
              How much of your monthly target you plan to put here.
            </span>
          </div>

          <div className="grid gap-2">
            <Label>Colour</Label>
            <div className="flex flex-wrap gap-2">
              {INVESTMENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-transform",
                    color === c ? "border-foreground scale-110" : "border-transparent",
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Colour ${c}`}
                  aria-pressed={color === c}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="inv-notes">Notes (optional)</Label>
            <Textarea id="inv-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {account ? "Save changes" : "Create card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------- Add crypto token ----------

export function TokenDialog({
  open,
  onOpenChange,
  accountName,
  existingSymbols,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountName: string
  existingSymbols: string[]
  onSave: (symbol: string, name: string) => Promise<unknown>
}) {
  const [symbol, setSymbol] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setSymbol("")
      setName("")
      setError(null)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const clean = symbol.trim().toUpperCase()
    if (!clean) return setError("Enter the token symbol")
    if (existingSymbols.includes(clean)) return setError(`${clean} is already on this card`)
    setSaving(true)
    await onSave(clean, name)
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClass}>
        <DialogHeader>
          <DialogTitle>Add token</DialogTitle>
          <DialogDescription>Add a token you buy under {accountName}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="token-symbol">Symbol</Label>
              <Input
                id="token-symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g. BTC"
                autoCapitalize="characters"
                maxLength={12}
                className={cn("uppercase", error && "border-destructive")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="token-name">Name (optional)</Label>
              <Input id="token-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bitcoin" />
            </div>
          </div>
          {error && <span className="text-xs text-destructive -mt-2">{error}</span>}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              Add token
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------- Update current value ----------

export function CurrentValueDialog({
  open,
  onOpenChange,
  account,
  invested,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: InvestmentAccount | null
  invested: number
  onSave: (value: number | null) => Promise<unknown>
}) {
  const [value, setValue] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setValue(typeof account?.currentValue === "number" ? String(account.currentValue) : "")
  }, [open, account])

  const parsed = parseAmount(value)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave(value.trim() === "" ? null : parsed)
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClass}>
        <DialogHeader>
          <DialogTitle>Update current value</DialogTitle>
          <DialogDescription>
            What is {account?.name} worth today? Check your {account?.provider || "investment"} app. You&apos;ve put in{" "}
            {formatCurrency(invested)}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="current-value">Current value</Label>
            <MoneyInput id="current-value" value={value} onChange={setValue} placeholder="e.g. 1250000" />
            {parsed !== null && invested > 0 && (
              <span className={cn("text-xs", parsed >= invested ? "text-emerald-500" : "text-red-500")}>
                {parsed >= invested ? "Gain" : "Loss"} of {formatCurrency(Math.abs(parsed - invested))} (
                {(((parsed - invested) / invested) * 100).toFixed(1)}%)
              </span>
            )}
            <span className="text-xs text-muted-foreground">Leave empty to stop tracking value for this card.</span>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || (value.trim() !== "" && parsed === null)}>
              Save value
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------- Monthly target ----------

export function TargetDialog({
  open,
  onOpenChange,
  currentTarget,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTarget: number | null
  onSave: (monthKey: string, amount: number) => Promise<unknown>
}) {
  const thisMonth = monthKeyOf(new Date())
  const [amount, setAmount] = useState("")
  const [fromMonth, setFromMonth] = useState(thisMonth)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setAmount(currentTarget ? String(currentTarget) : "")
      setFromMonth(thisMonth)
    }
  }, [open, currentTarget, thisMonth])

  const parsed = parseAmount(amount)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (parsed === null || parsed < 0) return
    setSaving(true)
    await onSave(fromMonth, parsed)
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClass}>
        <DialogHeader>
          <DialogTitle>Monthly investment target</DialogTitle>
          <DialogDescription>
            How much do you want to invest every month? Earlier months keep the target they had.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="target-amount">Target per month</Label>
            <MoneyInput id="target-amount" value={amount} onChange={setAmount} placeholder="How much per month?" invalid={amount !== "" && parsed === null} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="target-from">Starting from</Label>
            <Input
              id="target-from"
              type="month"
              value={fromMonth}
              onChange={(e) => e.target.value && setFromMonth(e.target.value)}
            />
            <span className="text-xs text-muted-foreground">
              Applies from {format(parseISO(`${fromMonth}-01`), "MMMM yyyy")} onwards.
            </span>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || parsed === null}>
              Save target
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
