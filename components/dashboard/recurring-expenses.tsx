"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/formatCurrency"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, MoreHorizontal, Trash2, Bell } from 'lucide-react'

// Mock data
const initialRecurringExpenses = [
  { id: "r1", name: "Netflix", amount: 15.99, frequency: "monthly", nextDue: "2025-06-01", daysUntilDue: 17 },
  { id: "r2", name: "Gym Membership", amount: 50, frequency: "monthly", nextDue: "2025-05-20", daysUntilDue: 5 },
  { id: "r3", name: "Internet Bill", amount: 79.99, frequency: "monthly", nextDue: "2025-05-25", daysUntilDue: 10 },
  { id: "r4", name: "Insurance", amount: 120, frequency: "monthly", nextDue: "2025-06-15", daysUntilDue: 32 },
]

export function RecurringExpenses() {
  const [recurringExpenses, setRecurringExpenses] = useState(initialRecurringExpenses)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newExpense, setNewExpense] = useState({ name: "", amount: "", frequency: "monthly" })

  const handleAddRecurring = () => {
    if (newExpense.name && newExpense.amount) {
      const nextDue = new Date()
      nextDue.setMonth(nextDue.getMonth() + 1)
      
      setRecurringExpenses([
        ...recurringExpenses,
        {
          id: `r${Date.now()}`,
          name: newExpense.name,
          amount: parseFloat(newExpense.amount),
          frequency: newExpense.frequency,
          nextDue: nextDue.toISOString().split("T")[0],
          daysUntilDue: Math.ceil((nextDue.getTime() - new Date().getTime()) / (1000 * 3600 * 24)),
        },
      ])
      setNewExpense({ name: "", amount: "", frequency: "monthly" })
      setIsDialogOpen(false)
    }
  }

  const handleDeleteRecurring = (id: string) => {
    setRecurringExpenses(recurringExpenses.filter((expense) => expense.id !== id))
  }

  const upcomingExpenses = recurringExpenses.filter((exp) => exp.daysUntilDue <= 7)
  const totalMonthly = recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Recurring Expenses</CardTitle>
            <CardDescription>Manage your subscriptions and recurring payments</CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Recurring
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {upcomingExpenses.length > 0 && (
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900 dark:text-yellow-50">
                  {upcomingExpenses.length} payment{upcomingExpenses.length !== 1 ? "s" : ""} due in 7 days
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-100">
                  {upcomingExpenses.map((exp) => exp.name).join(", ")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Monthly summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Monthly Recurring</p>
            <p className="text-2xl font-bold">${totalMonthly.toFixed(2)}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Number of Subscriptions</p>
            <p className="text-2xl font-bold">{recurringExpenses.length}</p>
          </div>
        </div>

        {/* Recurring expenses list */}
        <div className="space-y-3">
          {recurringExpenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="flex-1">
                <p className="font-medium">{expense.name}</p>
                <p className="text-sm text-muted-foreground">
                  <Calendar className="inline h-3.5 w-3.5 mr-1" />
                  Due in {expense.daysUntilDue} days ({expense.nextDue})
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="ml-2">
                  {formatCurrency(expense.amount)}/{expense.frequency.charAt(0).toUpperCase()}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDeleteRecurring(expense.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Add recurring expense dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Recurring Expense</DialogTitle>
            <DialogDescription>Add a new subscription or recurring payment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Netflix, Gym Membership"
                value={newExpense.name}
                onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={newExpense.frequency} onValueChange={(value) => setNewExpense({ ...newExpense, frequency: value })}>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRecurring}>Add Recurring</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
