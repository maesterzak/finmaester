"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, AlertCircle, CheckCircle2, BookOpen, Briefcase, Car, Coffee, Heart, Home, Landmark, ShoppingBag, Wallet } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/formatCurrency"

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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

interface BudgetAlert {
  categoryId: string
  categoryName: string
  spent: number
  budget: number
  icon: React.ComponentType<{ className?: string }>
  severity: "warning" | "critical" | "ok"
}

interface BudgetAlertsProps {
  categories: Array<{
    id?: string
    name: string
    icon: string
    budget: number
    spent?: number
  }>
}

export function BudgetAlerts({ categories }: BudgetAlertsProps) {
  const budgetAlerts: BudgetAlert[] = categories
    .map((cat) => {
      const spent = cat.spent || 0
      const budget = cat.budget || 0
      const percentage = budget > 0 ? (spent / budget) * 100 : 0
      let severity: "warning" | "critical" | "ok" = "ok"

      if (percentage >= 100) severity = "critical"
      else if (percentage >= 75) severity = "warning"

      // Get icon component from icon name string
      const IconComponent = iconMap[cat.icon] || ShoppingBag

      return {
        categoryId: cat.id || "",
        categoryName: cat.name,
        spent,
        budget,
        icon: IconComponent,
        severity,
      }
    })
    .filter((alert) => alert.severity !== "ok")
    .sort((a, b) => {
      if (a.severity === "critical" && b.severity !== "critical") return -1
      if (a.severity !== "critical" && b.severity === "critical") return 1
      return 0
    })

  if (budgetAlerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Budget Status
          </CardTitle>
          <CardDescription>All categories are within budget</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {budgetAlerts.some((a) => a.severity === "critical") ? (
            <AlertTriangle className="h-5 w-5 text-destructive" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
          Budget Alerts
        </CardTitle>
        <CardDescription>
          {budgetAlerts.filter((a) => a.severity === "critical").length} critical,{" "}
          {budgetAlerts.filter((a) => a.severity === "warning").length} warnings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgetAlerts.map((alert) => (
          <Alert
            key={alert.categoryId}
            className={
              alert.severity === "critical"
                ? "border-destructive/50 bg-destructive/5"
                : "border-yellow-500/50 bg-yellow-500/5"
            }
          >
            <div className="flex gap-4 w-full">
              <div className="flex-1">
                <AlertTitle className="flex items-center gap-2">
                  <alert.icon className="h-4 w-4" />
                  {alert.categoryName}
                  <Badge
                    variant={alert.severity === "critical" ? "destructive" : "outline"}
                    className="ml-auto"
                  >
                    {Math.round((alert.spent / alert.budget) * 100)}%
                  </Badge>
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{formatCurrency(alert.spent)} of {formatCurrency(alert.budget)}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(Math.max(0, alert.budget - alert.spent))} remaining
                      </span>
                    </div>
                    <Progress
                      value={Math.min(100, (alert.spent / alert.budget) * 100)}
                      className="h-2"
                      indicatorlassName={
                        alert.severity === "critical" ? "bg-destructive" : "bg-yellow-500"
                      }
                    />
                  </div>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  )
}
