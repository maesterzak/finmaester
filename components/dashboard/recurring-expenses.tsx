"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { addMonths, addWeeks, addYears, differenceInCalendarDays, format } from "date-fns"
import { Bell, CalendarClock, Loader2, MoreHorizontal, Plus, Repeat, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRecurringExpenses } from "@/hooks/useRecurringExpenses"
import type { RecurringExpense } from "@/lib/firebase/firestore"
import { currencySymbol, formatCurrency, symbolInputPadding } from "@/lib/formatCurrency"
import { fromDateKey, isValidDateKey, toDateKey } from "@/lib/periods"
import { cn } from "@/lib/utils"

type Frequency = RecurringExpense["frequency"]

const FREQUENCY_LABEL: Record<Frequency, string> = { weekly: "week", monthly: "month", yearly: "year" }

// What a payment costs per month, so weekly and yearly payments can be totalled fairly
const monthlyCost = (amount: number, frequency: Frequency) =>
  frequency === "weekly" ? (amount * 52) / 12 : frequency === "yearly" ? amount / 12 : amount

const step = (date: Date, frequency: Frequency) =>
  frequency === "weekly" ? addWeeks(date, 1) : frequency === "yearly" ? addYears(date, 1) : addMonths(date, 1)

// Stored due dates don't move on their own, so roll forward to the next payment on or after today
function nextOccurrence(dueKey: string, frequency: Frequency, today: Date) {
  if (!isValidDateKey(dueKey?.slice(0, 10))) return null
  let due = fromDateKey(dueKey)
  for (let i = 0; i < 1000 && differenceInCalendarDays(due, today) < 0; i++) due = step(due, frequency)
  return due
}

export function RecurringExpenses() {
  const { recurringExpenses, loading, addRecurringExpense, deleteRecurringExpense } = useRecurringExpenses()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<RecurringExpense | null>(null)
  const [form, setForm] = useState({ name: "", amount: "", frequency: "monthly" as Frequency, nextDue: "" })
  const [saving, setSaving] = useState(false)

  const items = useMemo(() => {
    const today = new Date()
    return recurringExpenses
      .map((exp) => {
        const due = nextOccurrence(exp.nextDue, exp.frequency, today)
        return { ...exp, due, daysLeft: due ? differenceInCalendarDays(due, today) : null }
      })
      .sort((a, b) => (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999))
  }, [recurringExpenses])

  const upcoming = items.filter((e) => e.daysLeft !== null && e.daysLeft <= 7)
  const totalMonthly = items.reduce((sum, e) => sum + monthlyCost(Number(e.amount) || 0, e.frequency), 0)

  const openDialog = () => {
    setForm({ name: "", amount: "", frequency: "monthly", nextDue: toDateKey(addMonths(new Date(), 1)) })
    setIsDialogOpen(true)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number.parseFloat(form.amount)
    if (!form.name.trim() || !(amount > 0) || !isValidDateKey(form.nextDue)) return
    setSaving(true)
    const success = await addRecurringExpense({
      name: form.name.trim(),
      amount,
      frequency: form.frequency,
      nextDue: form.nextDue,
    })
    setSaving(false)
    if (success) setIsDialogOpen(false)
  }

  const dueText = (daysLeft: number | null) => {
    if (daysLeft === null) return "No due date"
    if (daysLeft === 0) return "Due today"
    if (daysLeft === 1) return "Due tomorrow"
    return `Due in ${daysLeft} days`
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-xl">Recurring Payments</CardTitle>
            <CardDescription>Subscriptions, rent, data plans and other regular bills</CardDescription>
          </div>
          <Button onClick={openDialog} size="sm" className="gap-1.5 shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add payment</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-10 text-sm text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Repeat className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground max-w-xs">
              Add bills you pay regularly (Netflix, gym, rent, internet) to see what they cost you each month and
              what&apos;s due soon.
            </p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="flex items-start gap-3 rounded-lg bg-amber-500/10 p-3">
                <Bell className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm min-w-0">
                  <span className="font-medium">
                    {upcoming.length} payment{upcoming.length !== 1 ? "s" : ""} due this week:
                  </span>{" "}
                  <span className="text-muted-foreground break-words">
                    {upcoming.map((e) => `${e.name} (${formatCurrency(Number(e.amount) || 0)})`).join(", ")}
                  </span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Monthly cost</p>
                <p className="text-lg sm:text-xl font-bold">{formatCurrency(totalMonthly)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Yearly cost</p>
                <p className="text-lg sm:text-xl font-bold">{formatCurrency(totalMonthly * 12)}</p>
              </div>
            </div>

            <ul className="divide-y divide-border rounded-lg border">
              {items.map((exp) => (
                <li key={exp.id} className="flex items-center gap-3 py-2.5 pl-3 pr-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{exp.name}</p>
                    <p
                      className={cn(
                        "text-xs flex items-center gap-1",
                        exp.daysLeft !== null && exp.daysLeft <= 3 ? "text-amber-500" : "text-muted-foreground",
                      )}
                    >
                      <CalendarClock className="h-3 w-3 shrink-0" />
                      {dueText(exp.daysLeft)}
                      {exp.due && ` · ${format(exp.due, "d MMM")}`}
                    </p>
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {formatCurrency(Number(exp.amount) || 0)}
                    <span className="text-xs font-normal text-muted-foreground">/{FREQUENCY_LABEL[exp.frequency]}</span>
                  </span>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions for {exp.name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setPendingDelete(exp)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)] max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Add recurring payment</DialogTitle>
            <DialogDescription>A bill or subscription you pay on a schedule.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="rec-name">Name</Label>
              <Input
                id="rec-name"
                placeholder="e.g. Netflix, DSTV, Gym"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="rec-amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currencySymbol()}</span>
                  <Input
                    id="rec-amount"
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    placeholder="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    style={symbolInputPadding()}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rec-frequency">Every</Label>
                <Select
                  value={form.frequency}
                  onValueChange={(v) => setForm({ ...form, frequency: v as Frequency })}
                >
                  <SelectTrigger id="rec-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Week</SelectItem>
                    <SelectItem value="monthly">Month</SelectItem>
                    <SelectItem value="yearly">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rec-due">Next payment date</Label>
              <Input
                id="rec-due"
                type="date"
                value={form.nextDue}
                onChange={(e) => setForm({ ...form, nextDue: e.target.value })}
                required
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                Add payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the recurring payment reminder. Transactions you&apos;ve already recorded aren&apos;t affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => pendingDelete?.id && deleteRecurringExpense(pendingDelete.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
