"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, Loader2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { useTransactions } from "@/hooks/useTransactions"
import { formatCurrency } from "@/lib/formatCurrency"

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f43f5e"]

export function IncomeAnalytics() {
  const { transactions, loading } = useTransactions()

  const incomeTransactions = transactions.filter((t) => t.type === "income")

  // Group by Category Name or Description to identify sources
  const groupedSources = incomeTransactions.reduce((acc, t) => {
    const name = t.categoryName || t.description || "Other Income"
    acc[name] = (acc[name] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)

  const totalIncome = Object.values(groupedSources).reduce((a, b) => a + b, 0)

  const incomeSourcesData = Object.entries(groupedSources).map(([name, amount], index) => {
    const percentage = totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0
    return {
      id: `source-${index}`,
      name,
      amount,
      percentage,
      color: COLORS[index % COLORS.length],
    }
  })

  // Group by month (last 6 months)
  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const now = new Date()
  const recentMonths: { year: number; month: number; label: string; key: string }[] = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    recentMonths.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: MONTH_NAMES[d.getMonth()],
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, // "2026-07"
    })
  }

  // Find all unique source names to dynamically plot bar charts
  const uniqueSources = Array.from(
    new Set(incomeTransactions.map((t) => t.categoryName || t.description || "Other Income"))
  )

  const monthlyIncomeData = recentMonths.map(({ label, key }) => {
    const monthTx = incomeTransactions.filter((t) => t.date.startsWith(key))
    const total = monthTx.reduce((sum, t) => sum + t.amount, 0)

    // Calculate details for each source
    const sourceDetails: Record<string, number> = {}
    uniqueSources.forEach((src) => {
      sourceDetails[src] = monthTx
        .filter((t) => (t.categoryName || t.description || "Other Income") === src)
        .reduce((sum, t) => sum + t.amount, 0)
    })

    return {
      month: label,
      total,
      ...sourceDetails,
    }
  })

  const avgMonthlyIncome = monthlyIncomeData.reduce((sum, d) => sum + d.total, 0) / monthlyIncomeData.length

  // Calculate MoM Growth
  let cumulative = 0
  const incomeGrowthData = monthlyIncomeData.map((d, index) => {
    cumulative += d.total
    let growth = 0
    if (index > 0) {
      const prev = monthlyIncomeData[index - 1].total
      growth = prev > 0 ? Number((((d.total - prev) / prev) * 100).toFixed(2)) : 0
    }
    return {
      month: d.month,
      growth,
      cumulative,
    }
  })

  const currentMonthGrowth = incomeGrowthData[incomeGrowthData.length - 1]?.growth || 0

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Income Tracking & Analytics</CardTitle>
            <CardDescription>Analyze your income sources and growth</CardDescription>
          </div>
          {currentMonthGrowth !== 0 && (
            <Badge variant="outline" className="ml-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              {currentMonthGrowth > 0 ? `+${currentMonthGrowth}%` : `${currentMonthGrowth}%`} this month
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading income analytics...</span>
          </div>
        ) : incomeTransactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No income transactions recorded yet. Add some to view analytics.
          </div>
        ) : (
          <Tabs defaultValue="sources" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sources">Sources</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="growth">Growth</TabsTrigger>
            </TabsList>

            <TabsContent value="sources" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pie chart */}
                <div className="flex justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={incomeSourcesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {incomeSourcesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Income sources list */}
                <div className="space-y-3">
                  {incomeSourcesData.map((source) => (
                    <div key={source.id} className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: source.color }}
                          />
                          <p className="font-medium">{source.name}</p>
                        </div>
                        <Badge variant="secondary">{source.percentage}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatCurrency(source.amount)} of {formatCurrency(totalIncome)}
                      </p>
                    </div>
                  ))}
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Current Income</span>
                      <span className="text-lg">{formatCurrency(totalIncome)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Average Monthly Income: {formatCurrency(avgMonthlyIncome)}</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyIncomeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                  {uniqueSources.slice(0, 5).map((source, index) => (
                    <Bar key={source} dataKey={source} stackId="a" fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="growth" className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={incomeGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" yAxisId="left" />
                  <YAxis stroke="hsl(var(--muted-foreground))" yAxisId="right" orientation="right" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value, name) => name === "Growth %" ? `${value}%` : formatCurrency(Number(value))}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="growth"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Growth %"
                    dot={{ fill: "#10b981", r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Cumulative Income"
                    dot={{ fill: "#3b82f6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
