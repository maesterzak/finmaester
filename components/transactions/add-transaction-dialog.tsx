"use client"

import React, { useEffect, useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Landmark, ShoppingBag, Coins, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCategories } from "@/hooks/useCategories"
import { useProfiles } from "@/hooks/useProfile"
import { getCurrencySymbol } from "@/lib/currency"
import { fromDateKey, toDateKey } from "@/lib/periods"
import { getCategoryIcon } from "@/lib/category-icons"
import Link from "next/link"
import { useInvestments } from "@/hooks/useInvestments"
import { legacyAssetType } from "@/lib/investments"

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (transaction: any) => void
  onUpdate?: (transaction: any) => void
  transaction?: any
  // Prefills a new transaction, e.g. "Invest" on an investment card
  defaults?: {
    type?: "income" | "expense" | "investment"
    investmentAccountId?: string
    investmentTokenId?: string
  }
}

// Zod Schema for validation
const transactionSchema = z.object({
  type: z.enum(["income", "expense", "investment"]),
  amount: z.number().gt(0, { message: "Amount must be greater than 0" }),
  description: z.string().min(1, { message: "Description is required" }),
  categoryId: z.string().optional(),
  assetName: z.string().optional(),
  assetType: z.enum(["stock", "mutual_fund", "crypto", "fixed_income", "other"]).optional(),
  units: z.number().optional(),
  unitPrice: z.number().optional(),
})

export function AddTransactionDialog({
  open,
  onOpenChange,
  onAdd,
  onUpdate,
  transaction,
  defaults,
}: AddTransactionDialogProps) {
  const { categories } = useCategories()
  const { accounts: investmentAccounts, refresh: refreshInvestments } = useInvestments()
  const { loadProfile } = useProfiles()
  const [currencySymbol, setCurrencySymbol] = useState("₦")

  const [type, setType] = useState<"income" | "expense" | "investment">("expense")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [date, setDate] = useState<Date>(new Date())

  // Investment-specific fields
  const [assetName, setAssetName] = useState("")
  const [assetType, setAssetType] = useState<"stock" | "mutual_fund" | "crypto" | "fixed_income" | "other">("stock")
  const [units, setUnits] = useState("")
  const [unitPrice, setUnitPrice] = useState("")
  const [investmentAccountId, setInvestmentAccountId] = useState("")
  const [investmentTokenId, setInvestmentTokenId] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch currency symbol from user settings
  useEffect(() => {
    if (open) {
      const fetchSettings = async () => {
        const profile = await loadProfile()
        if (profile?.currency) {
          const symbol = getCurrencySymbol(profile.currency as any) || "₦"
          setCurrencySymbol(symbol)
        }
      }
      fetchSettings()
    }
  }, [open])

  // Sync state with selected transaction or defaults
  useEffect(() => {
    setErrors({})
    if (transaction) {
      setType(transaction.type)
      setAmount(transaction.amount.toString())
      setDescription(transaction.description)
      setCategoryId(transaction.categoryId || "")
      // Parse "yyyy-MM-dd" as a local date; new Date() would read it as UTC
      setDate(transaction.date ? fromDateKey(transaction.date) : new Date())
      setAssetName(transaction.assetName || "")
      setAssetType(transaction.assetType || "stock")
      setUnits(transaction.units?.toString() || "")
      setUnitPrice(transaction.unitPrice?.toString() || "")
      setInvestmentAccountId(transaction.investmentAccountId || "")
      setInvestmentTokenId(transaction.investmentTokenId || "")
    } else {
      setType(defaults?.type || "expense")
      setAmount("")
      setDescription("")
      setCategoryId("")
      setDate(new Date())
      setAssetName("")
      setAssetType("stock")
      setUnits("")
      setUnitPrice("")
      setInvestmentAccountId(defaults?.investmentAccountId || "")
      setInvestmentTokenId(defaults?.investmentTokenId || "")
    }
    // Pick up cards created since this dialog was mounted
    if (open) refreshInvestments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transaction])

  const selectedAccount = investmentAccounts.find((a) => a.id === investmentAccountId)
  const accountTokens = Object.values(selectedAccount?.tokens || {}).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  )
  const isCrypto = selectedAccount?.type === "crypto"

  // Auto-calculate amount when units and unit price change
  useEffect(() => {
    if (type === "investment" && units && unitPrice) {
      const calculated = parseFloat(units) * parseFloat(unitPrice)
      if (!isNaN(calculated)) {
        setAmount(calculated.toFixed(2))
      }
    }
  }, [units, unitPrice, type])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const numAmount = parseFloat(amount) || 0
    const numUnits = units ? parseFloat(units) : undefined
    const numUnitPrice = unitPrice ? parseFloat(unitPrice) : undefined

    // Validate using Zod
    const selectedToken = accountTokens.find((t) => t.id === investmentTokenId)
    const derivedAssetName = selectedAccount
      ? selectedToken
        ? `${selectedAccount.name} · ${selectedToken.symbol}`
        : selectedAccount.name
      : assetName
    const derivedAssetType = selectedAccount ? legacyAssetType(selectedAccount.type) : assetType

    const payload = {
      type,
      amount: numAmount,
      description,
      categoryId: type === "investment" ? undefined : categoryId,
      assetName: type === "investment" ? derivedAssetName : undefined,
      assetType: type === "investment" ? derivedAssetType : undefined,
      units: type === "investment" ? numUnits : undefined,
      unitPrice: type === "investment" ? numUnitPrice : undefined,
    }

    const validation = transactionSchema.safeParse(payload)

    const newErrors: Record<string, string> = {}

    if (!validation.success) {
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message
        }
      })
    }

    // Additional validations
    if (type === "expense" && !categoryId) {
      newErrors.categoryId = "Category is required for expenses"
    }
    if (type === "investment" && !selectedAccount) {
      newErrors.investmentAccountId = "Choose which investment this goes into"
    }
    if (type === "investment" && isCrypto && accountTokens.length > 0 && !investmentTokenId) {
      newErrors.investmentTokenId = "Choose which token you bought"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const selectedCategory = categories.find((cat) => cat.id === categoryId)

    const finalTransaction = {
      id: transaction?.id || undefined,
      type,
      category: type === "investment" ? "Investment" : (selectedCategory?.name || "Uncategorized"),
      categoryId: type === "investment" ? "investment-cat" : categoryId,
      icon: type === "investment" ? "Coins" : (selectedCategory?.icon || "ShoppingBag"),
      amount: numAmount,
      // Local calendar date; toISOString() converts to UTC and can shift it to the previous day
      date: toDateKey(date),
      description,
      ...(type === "investment" ? {
        assetName: derivedAssetName,
        assetType: derivedAssetType,
        units: numUnits,
        unitPrice: numUnitPrice,
        investmentAccountId: selectedAccount?.id,
        investmentTokenId: isCrypto && selectedToken ? selectedToken.id : undefined,
      } : {}),
    }

    if (transaction && onUpdate) {
      onUpdate(finalTransaction)
    } else {
      onAdd(finalTransaction)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] max-h-[90dvh] overflow-y-auto p-4 sm:p-6 bg-[#110E0D] border-border text-foreground rounded-lg">
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
          <DialogDescription>
            {transaction ? "Update your transaction details." : "Add a new income, expense, or investment transaction."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
          {/* Transaction Type */}
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">Transaction Type</Label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <label className="flex items-center gap-2 text-green-600 dark:text-green-400 cursor-pointer">
                <input
                  type="radio"
                  value="income"
                  checked={type === "income"}
                  onChange={() => setType("income")}
                  className="accent-green-600"
                />
                <Landmark className="h-4 w-4" /> Income
              </label>
              <label className="flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer">
                <input
                  type="radio"
                  value="expense"
                  checked={type === "expense"}
                  onChange={() => setType("expense")}
                  className="accent-red-600"
                />
                <ShoppingBag className="h-4 w-4" /> Expense
              </label>
              <label className="flex items-center gap-2 text-blue-600 dark:text-blue-400 cursor-pointer">
                <input
                  type="radio"
                  value="investment"
                  checked={type === "investment"}
                  onChange={() => setType("investment")}
                  className="accent-blue-600"
                />
                <TrendingUp className="h-4 w-4" /> Investment
              </label>
            </div>
          </div>

          {/* Investment card (and token for crypto) */}
          {type === "investment" && (
            <>
              {investmentAccounts.length === 0 ? (
                <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                  You don&apos;t have any investment cards yet.{" "}
                  <Link href="/dashboard/investments" className="font-medium text-primary hover:underline">
                    Create one on the Investments page
                  </Link>{" "}
                  first, e.g. &ldquo;Cowrywise MM Fund&rdquo; or &ldquo;Crypto&rdquo;.
                  {errors.investmentAccountId && (
                    <span className="block mt-1 text-xs text-destructive">{errors.investmentAccountId}</span>
                  )}
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="investmentAccountId">Invest into</Label>
                  <Select
                    value={investmentAccountId}
                    onValueChange={(v) => {
                      setInvestmentAccountId(v)
                      setInvestmentTokenId("")
                    }}
                  >
                    <SelectTrigger
                      id="investmentAccountId"
                      className={cn(errors.investmentAccountId && "border-destructive")}
                    >
                      <SelectValue placeholder="Select an investment card" />
                    </SelectTrigger>
                    <SelectContent>
                      {investmentAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: account.color }} />
                            {account.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.investmentAccountId && (
                    <span className="text-xs text-destructive">{errors.investmentAccountId}</span>
                  )}
                  {transaction?.assetName && !transaction?.investmentAccountId && (
                    <span className="text-xs text-muted-foreground">
                      Previously recorded as &ldquo;{transaction.assetName}&rdquo;
                    </span>
                  )}
                </div>
              )}

              {isCrypto && (
                <div className="grid gap-2">
                  <Label htmlFor="investmentTokenId">Token</Label>
                  {accountTokens.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No tokens on this card yet. Add tokens (e.g. BTC, ETH) from its card on the Investments page.
                    </p>
                  ) : (
                    <Select value={investmentTokenId} onValueChange={setInvestmentTokenId}>
                      <SelectTrigger
                        id="investmentTokenId"
                        className={cn(errors.investmentTokenId && "border-destructive")}
                      >
                        <SelectValue placeholder="Select a token" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTokens.map((token) => (
                          <SelectItem key={token.id} value={token.id}>
                            {token.symbol}
                            {token.name ? ` · ${token.name}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {errors.investmentTokenId && (
                    <span className="text-xs text-destructive">{errors.investmentTokenId}</span>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="units">{isCrypto ? "Quantity (optional)" : "Units (optional)"}</Label>
                  <Input
                    id="units"
                    type="number"
                    step="any"
                    inputMode="decimal"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    placeholder={isCrypto ? "e.g. 0.0021" : "e.g. 100"}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unitPrice">{isCrypto ? "Price per token" : "Unit price"} (optional)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="any"
                    inputMode="decimal"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="e.g. 2.50"
                  />
                </div>
              </div>
            </>
          )}

          {/* Amount */}
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">{currencySymbol}</span>
              <Input
                id="amount"
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={cn("pl-7", errors.amount && "border-destructive")}
              />
            </div>
            {errors.amount && <span className="text-xs text-destructive">{errors.amount}</span>}
          </div>

          {/* Date */}
          <div className="grid gap-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" /> {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Category - Excluded for Investments */}
          {type !== "investment" && (
            <div className="grid gap-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="categoryId" className={cn(errors.categoryId && "border-destructive")}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => {
                    const Icon = getCategoryIcon(cat.icon)
                    return (
                      <SelectItem key={cat.id} value={cat.id!}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" /> {cat.name}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {errors.categoryId && <span className="text-xs text-destructive">{errors.categoryId}</span>}
            </div>
          )}

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter transaction details..."
              className={cn(errors.description && "border-destructive")}
            />
            {errors.description && <span className="text-xs text-destructive">{errors.description}</span>}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full mt-2">
            {transaction ? "Update Transaction" : "Add Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
