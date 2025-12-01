"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, Briefcase, Gift } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

// Mock income data - in a real app, this would come from your API
const incomeSourcesData = [
  { id: "i1", name: "Salary", amount: 2500, percentage: 70, icon: Briefcase, color: "#10b981" },
  { id: "i2", name: "Freelance", amount: 800, percentage: 22, icon: Gift, color: "#3b82f6" },
  { id: "i3", name: "Bonus", amount: 200, percentage: 8, icon: TrendingUp, color: "#f59e0b" },
]

const monthlyIncomeData = [
  { month: "Jan", salary: 2500, freelance: 500, bonus: 0, total: 3000 },
  { month: "Feb", salary: 2500, freelance: 600, bonus: 0, total: 3100 },
  { month: "Mar", salary: 2500, freelance: 700, bonus: 200, total: 3400 },
  { month: "Apr", salary: 2500, freelance: 800, bonus: 0, total: 3300 },
  { month: "May", salary: 2500, freelance: 800, bonus: 200, total: 3500 },
]

const incomeGrowthData = [
  { month: "Jan", growth: 0, cumulative: 3000 },
  { month: "Feb", growth: 3.33, cumulative: 6100 },
  { month: "Mar", growth: 9.68, cumulative: 9500 },
  { month: "Apr", growth: 9.09, cumulative: 12800 },
  { month: "May", growth: 15.15, cumulative: 16300 },
]

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

export function IncomeAnalytics() {
  const totalIncome = incomeSourcesData.reduce((sum, source) => sum + source.amount, 0)
  const avgMonthlyIncome = monthlyIncomeData.reduce((sum, data) => sum + data.total, 0) / monthlyIncomeData.length

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Income Tracking & Analytics</CardTitle>
            <CardDescription>Analyze your income sources and growth</CardDescription>
          </div>
          <Badge variant="outline" className="ml-2">
            <TrendingUp className="h-3 w-3 mr-1" />
            +15.15% this month
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
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
                />
                <Legend />
                <Bar dataKey="salary" stackId="a" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="freelance" stackId="a" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="bonus" stackId="a" fill="#f59e0b" radius={[8, 8, 0, 0]} />
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
      </CardContent>
    </Card>
  )
}
