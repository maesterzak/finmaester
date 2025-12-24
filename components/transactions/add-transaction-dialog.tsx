"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Briefcase, Car, Coffee, Heart, Home, Landmark, ShoppingBag, Wallet, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useCategories } from "@/hooks/useCategories"

// Icon mapping
const iconMap: Record<string, any> = {
  Briefcase, Wallet, Car, BookOpen, Heart, ShoppingBag, Landmark, Coffee, Home
}

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (transaction: any) => void
  onUpdate?: (transaction: any) => void
  transaction?: any
}

export function AddTransactionDialog({ open, onOpenChange, onAdd, onUpdate, transaction }: AddTransactionDialogProps) {
  const { categories } = useCategories()
  const [type, setType] = useState("expense")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [date, setDate] = useState<Date>(new Date())

  useEffect(() => {
    if (transaction) {
      setType(transaction.type)
      setAmount(transaction.amount.toString())
      setDescription(transaction.description)
      setCategoryId(transaction.categoryId || "")
      setDate(new Date(transaction.date))
    } else {
      setType("expense")
      setAmount("")
      setDescription("")
      setCategoryId("")
      setDate(new Date())
    }
  }, [open, transaction])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedCategory = categories.find((cat) => cat.id === categoryId)

    const newTransaction = {
      id: transaction?.id || undefined,
      type,
      category: selectedCategory?.name || "Uncategorized",
      categoryId,
      icon: selectedCategory?.icon || "ShoppingBag",
      amount: Number.parseFloat(amount) || 0,
      date: date.toISOString().split("T")[0],
      description,
    }

    if (transaction && onUpdate) onUpdate(newTransaction)
    else onAdd(newTransaction)
    onOpenChange(false) // close modal after submit
  }

  if (!open) return null

  return (
    <div className="relative">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/90 z-40 w-[100vw] overflow-hidden flex items-center justify-center"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] md:w-[50vw] z-50  bg-[#110E0D] rounded-lg shadow-lg p-6  max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">{transaction ? "Edit Transaction" : "Add New Transaction"}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {transaction ? "Update your transaction details." : "Add a new income or expense transaction."}
        </p>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {/* Transaction Type */}
          <div className="grid gap-2">
            <Label>Transaction Type</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <input
                  type="radio"
                  value="income"
                  checked={type === "income"}
                  onChange={() => setType("income")}
                />
                <Landmark className="h-4 w-4" /> Income
              </label>
              <label className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <input
                  type="radio"
                  value="expense"
                  checked={type === "expense"}
                  onChange={() => setType("expense")}
                />
                <ShoppingBag className="h-4 w-4" /> Expense
              </label>
            </div>
          </div>

          {/* Amount */}
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5">₦</span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-7"
                required
              />
            </div>
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

          {/* Category */}
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => {
                  const Icon = iconMap[cat.icon] || ShoppingBag
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
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter transaction details..."
              required
            />
          </div>

          {/* Submit */}
          <Button type="submit">{transaction ? "Update Transaction" : "Add Transaction"}</Button>
        </form>
      </div>
    </div>
  )
}
