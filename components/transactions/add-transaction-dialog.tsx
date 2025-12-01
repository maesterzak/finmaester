"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Briefcase, Car, Coffee, Heart, Home, Landmark, ShoppingBag, Wallet } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCategories } from "@/hooks/useCategories"
import { formatCurrency } from "@/lib/formatCurrency"

// Icon mapping
const iconMap: Record<string, any> = {
  Briefcase: Briefcase,
  Wallet: Wallet,
  Car: Car,
  BookOpen: BookOpen,
  Heart: Heart,
  ShoppingBag: ShoppingBag,
  Landmark: Landmark,
  Coffee: Coffee,
  Home: Home,
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




  // Reset form when dialog opens/closes or when editing a transaction
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

    if (transaction && onUpdate) {
      onUpdate(newTransaction)
    } else {
      console.log("Adding transaction 4", newTransaction)
      onAdd(newTransaction)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{transaction ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
            <DialogDescription>
              {transaction ? "Update your transaction details." : "Add a new income or expense transaction."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Transaction Type</Label>
              <RadioGroup value={type} onValueChange={setType} className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="type-income" />
                  <Label htmlFor="type-income" className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Landmark className="h-4 w-4" />
                    Income
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="type-expense" />
                  <Label htmlFor="type-expense" className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <ShoppingBag className="h-4 w-4" />
                    Expense
                  </Label>
                </div>
              </RadioGroup>
            </div>
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
                  min="0"
                  step="0.01"
                  className="pl-7"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((cat) => {
                      // For expenses, show all categories except income-specific ones
                      // For income, show all categories (users can categorize income too)
                      return true
                    })
                    .map((category) => {
                      const IconComponent = iconMap[category.icon] || ShoppingBag
                      return (
                        <SelectItem key={category.id} value={category.id!}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  {categories.length === 0 && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">No categories available</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter transaction details..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{transaction ? "Update Transaction" : "Add Transaction"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>

    </Dialog>
  )
}
