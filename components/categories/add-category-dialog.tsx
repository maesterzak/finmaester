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
import { BookOpen, Briefcase, Car, Coffee, Gift, Heart, Home, ShoppingBag, Wallet, DollarSign } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const iconOptions = [
  { value: "Briefcase", label: "Investment", icon: Briefcase },
  { value: "Wallet", label: "Savings", icon: Wallet },
  { value: "Car", label: "Transport", icon: Car },
  { value: "BookOpen", label: "Education", icon: BookOpen },
  { value: "Heart", label: "Personal", icon: Heart },
  { value: "Home", label: "Housing", icon: Home },
  { value: "ShoppingBag", label: "Shopping", icon: ShoppingBag },
  { value: "Coffee", label: "Food", icon: Coffee },
  { value: "Gift", label: "Gifts", icon: Gift },
]

const colorOptions = [
  { value: "#8884d8", label: "Purple" },
  { value: "#82ca9d", label: "Green" },
  { value: "#ffc658", label: "Yellow" },
  { value: "#ff8042", label: "Orange" },
  { value: "#0088fe", label: "Blue" },
  { value: "#ff6b6b", label: "Red" },
  { value: "#8dd1e1", label: "Teal" },
  { value: "#a4de6c", label: "Lime" },
]

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

interface AddCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (category: any) => void
  onUpdate?: (category: any) => void
  category?: any
  selectedMonth?: number
  selectedYear?: number
}

export function AddCategoryDialog({
  open,
  onOpenChange,
  onAdd,
  onUpdate,
  category,
  selectedMonth = new Date().getMonth(),
  selectedYear = new Date().getFullYear(),
}: AddCategoryDialogProps) {
  const [name, setName] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("Briefcase")
  const [selectedColor, setSelectedColor] = useState("#8884d8")
  const [budget, setBudget] = useState("")

  // Reset form when dialog opens/closes or when editing a category
  useEffect(() => {
    if (category) {
      setName(category.name)
      // Handle icon - could be a component or string
      const iconName = typeof category.icon === "string" ? category.icon : category.icon?.name || "Briefcase"
      setSelectedIcon(iconName)
      setSelectedColor(category.color)
      // Get budget for current month
      const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`
      const monthBudget = category.monthlyBudgets?.[monthKey] || category.budget || 0
      setBudget(monthBudget.toString())
    } else {
      setName("")
      setSelectedIcon("Briefcase")
      setSelectedColor("#8884d8")
      setBudget("")
    }
  }, [open, category, selectedMonth, selectedYear])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const IconComponent = iconOptions.find((icon) => icon.value === selectedIcon)?.icon || Briefcase

    const newCategory = {
      id: category?.id,
      name,
      icon: IconComponent.displayName,
      color: selectedColor,
      budget: Number.parseFloat(budget) || 0,
      // Keep existing data if editing
      monthlyBudgets: category?.monthlyBudgets || {},
      monthlySpending: category?.monthlySpending || {},
    }

    if (category && onUpdate) {
      onUpdate(newCategory)
    } else {
      onAdd(newCategory)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{category ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogDescription>
              {category
                ? "Update your expense category details."
                : `Create a new category. The budget will be set for ${monthNames[selectedMonth]} ${selectedYear}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Groceries"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Icon</Label>
              <RadioGroup value={selectedIcon} onValueChange={setSelectedIcon} className="grid grid-cols-3 gap-2">
                {iconOptions.map((icon) => (
                  <div key={icon.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={icon.value} id={`icon-${icon.value}`} className="sr-only" />
                    <Label
                      htmlFor={`icon-${icon.value}`}
                      className={`flex flex-col items-center justify-center rounded-md border-2 border-muted p-2 hover:border-accent cursor-pointer transition-colors ${
                        selectedIcon === icon.value ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <icon.icon className="mb-1 h-5 w-5" />
                      <span className="text-xs">{icon.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="grid gap-2">
              <Label>Color</Label>
              <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <div key={color.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={color.value} id={`color-${color.value}`} className="sr-only" />
                    <Label
                      htmlFor={`color-${color.value}`}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted hover:border-accent cursor-pointer transition-all ${
                        selectedColor === color.value ? "border-primary ring-2 ring-primary ring-offset-2" : ""
                      }`}
                      style={{ backgroundColor: color.value }}
                    >
                      <span className="sr-only">{color.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="budget">
                Budget for {monthNames[selectedMonth]} {selectedYear}
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {category
                  ? "This will update the budget for this specific month only."
                  : "You can set different budgets for each month later."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{category ? "Update Category" : "Add Category"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
