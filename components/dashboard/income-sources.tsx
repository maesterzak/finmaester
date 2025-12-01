"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/formatCurrency"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2 } from 'lucide-react'

const initialIncomeSources = [
  { id: "i1", name: "Salary", averageMonthly: 2500, lastPayment: "2025-05-01", category: "Regular" },
  { id: "i2", name: "Freelance Projects", averageMonthly: 800, lastPayment: "2025-05-15", category: "Variable" },
]

export function IncomeSources() {
  const [sources, setSources] = useState(initialIncomeSources)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSource, setNewSource] = useState({ name: "", averageMonthly: "", category: "Regular" })

  const handleAddSource = () => {
    if (newSource.name && newSource.averageMonthly) {
      setSources([
        ...sources,
        {
          id: `i${Date.now()}`,
          name: newSource.name,
          averageMonthly: parseFloat(newSource.averageMonthly),
          lastPayment: new Date().toISOString().split("T")[0],
          category: newSource.category,
        },
      ])
      setNewSource({ name: "", averageMonthly: "", category: "Regular" })
      setIsDialogOpen(false)
    }
  }

  const handleDeleteSource = (id: string) => {
    setSources(sources.filter((source) => source.id !== id))
  }

  const totalMonthlyIncome = sources.reduce((sum, source) => sum + source.averageMonthly, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Income Sources</CardTitle>
            <CardDescription>Manage your income streams</CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Source
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-sm text-muted-foreground mb-1">Total Monthly Income</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalMonthlyIncome)}</p>
          </div>
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-muted-foreground mb-1">Income Streams</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{sources.length}</p>
          </div>
        </div>

        <div className="space-y-3">
          {sources.map((source) => (
            <div key={source.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="flex-1">
                <p className="font-medium">{source.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(source.averageMonthly)}/month • Last: {source.lastPayment}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteSource(source.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Income Source</DialogTitle>
            <DialogDescription>Add a new income source to track</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="source-name">Source Name</Label>
              <Input
                id="source-name"
                placeholder="e.g., Monthly Salary"
                value={newSource.name}
                onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly-amount">Average Monthly Amount</Label>
              <Input
                id="monthly-amount"
                type="number"
                placeholder="0.00"
                value={newSource.averageMonthly}
                onChange={(e) => setNewSource({ ...newSource, averageMonthly: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSource}>Add Source</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
