"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Plus, MoreHorizontal, Trash2, Clock, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatCurrency } from "@/lib/formatCurrency"

const initialSubscriptions = [
  {
    id: "s1",
    name: "Netflix",
    provider: "Entertainment",
    amount: 15.99,
    renewalDate: "2025-06-01",
    status: "active",
    daysUntilRenewal: 17,
  },
  {
    id: "s2",
    name: "Adobe Creative Cloud",
    provider: "Software",
    amount: 54.99,
    renewalDate: "2025-05-20",
    status: "active",
    daysUntilRenewal: 5,
  },
  {
    id: "s3",
    name: "Spotify",
    provider: "Entertainment",
    amount: 12.99,
    renewalDate: "2025-05-25",
    status: "active",
    daysUntilRenewal: 10,
  },
  {
    id: "s4",
    name: "Gym Membership",
    provider: "Health",
    amount: 50,
    renewalDate: "2025-06-10",
    status: "active",
    daysUntilRenewal: 26,
  },
]

export function SubscriptionTracker() {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filterCategory, setFilterCategory] = useState("all")
  const [newSubscription, setNewSubscription] = useState({
    name: "",
    provider: "Entertainment",
    amount: "",
  })

  const handleAddSubscription = () => {
    if (newSubscription.name && newSubscription.amount) {
      const renewalDate = new Date()
      renewalDate.setMonth(renewalDate.getMonth() + 1)

      setSubscriptions([
        ...subscriptions,
        {
          id: `s${Date.now()}`,
          name: newSubscription.name,
          provider: newSubscription.provider,
          amount: parseFloat(newSubscription.amount),
          renewalDate: renewalDate.toISOString().split("T")[0],
          status: "active",
          daysUntilRenewal: Math.ceil((renewalDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)),
        },
      ])
      setNewSubscription({ name: "", provider: "Entertainment", amount: "" })
      setIsDialogOpen(false)
    }
  }

  const handleCancelSubscription = (id: string) => {
    setSubscriptions(subscriptions.map((sub) => (sub.id === id ? { ...sub, status: "cancelled" } : sub)))
  }

  const handleDeleteSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter((sub) => sub.id !== id))
  }

  const filteredSubscriptions =
    filterCategory === "all"
      ? subscriptions.filter((sub) => sub.status === "active")
      : subscriptions.filter((sub) => sub.status === "active" && sub.provider === filterCategory)

  const renewalAlerts = filteredSubscriptions.filter((sub) => sub.daysUntilRenewal <= 7)
  const totalMonthlyCost = filteredSubscriptions.reduce((sum, sub) => sum + sub.amount, 0)
  const categories = [...new Set(subscriptions.map((sub) => sub.provider))]

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Subscription Tracker</CardTitle>
            <CardDescription>Monitor and manage all your subscriptions</CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Subscription
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Renewal alerts */}
        {renewalAlerts.length > 0 && (
          <Alert className="border-yellow-500/50 bg-yellow-500/5">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
            <AlertTitle>Upcoming Renewals</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1">
                {renewalAlerts.map((sub) => (
                  <div key={sub.id} className="text-sm">
                    {sub.name} renews in {sub.daysUntilRenewal} day{sub.daysUntilRenewal !== 1 ? "s" : ""} ({formatCurrency(sub.amount)})
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 border">
            <p className="text-sm text-muted-foreground mb-1">Active Subscriptions</p>
            <p className="text-2xl font-bold">{filteredSubscriptions.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border">
            <p className="text-sm text-muted-foreground mb-1">Monthly Cost</p>
            <p className="text-2xl font-bold">{formatCurrency(totalMonthlyCost)}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border">
            <p className="text-sm text-muted-foreground mb-1">Annual Cost</p>
            <p className="text-2xl font-bold">{formatCurrency(totalMonthlyCost * 12)}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory("all")}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={filterCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Subscriptions list */}
        <div className="space-y-3">
          {filteredSubscriptions.length > 0 ? (
            filteredSubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{subscription.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {subscription.provider}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Clock className="h-3.5 w-3.5" />
                    Renews in {subscription.daysUntilRenewal} days ({subscription.renewalDate})
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{formatCurrency(subscription.amount)}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-yellow-600 dark:text-yellow-500 focus:text-yellow-600 dark:focus:text-yellow-500"
                        onClick={() => handleCancelSubscription(subscription.id)}
                      >
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Cancel
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteSubscription(subscription.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No subscriptions found in this category
            </div>
          )}
        </div>
      </CardContent>

      {/* Add subscription dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subscription</DialogTitle>
            <DialogDescription>Track a new subscription service</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sub-name">Subscription Name</Label>
              <Input
                id="sub-name"
                placeholder="e.g., Netflix, Spotify"
                value={newSubscription.name}
                onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={newSubscription.provider} onValueChange={(value) => setNewSubscription({ ...newSubscription, provider: value })}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Health">Health & Fitness</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Productivity">Productivity</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Monthly Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={newSubscription.amount}
                onChange={(e) => setNewSubscription({ ...newSubscription, amount: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubscription}>Add Subscription</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
