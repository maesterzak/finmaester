"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownIcon, ArrowUpIcon, DollarSign,CalendarDays } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTransactions } from "@/hooks/useTransactions"
import { calculateSummaryByPeriod } from "@/lib/calculations"
import { formatCurrency } from "@/lib/formatCurrency"

const months = [
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
export function FinanceSummary() {
  const { transactions, loading } = useTransactions()
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly")
  const [activeTab, setActiveTab] = useState("monthly")
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())

  // Generate year options
  const yearOptions = Array.from({ length: 4 }, (_, i) => currentDate.getFullYear() - 2 + i)

  const summaryData = useMemo(() => {
    if (loading || transactions.length === 0) {
      return { income: 0, expenses: 0, balance: 0 }
    }
    return calculateSummaryByPeriod(transactions, period)
  }, [transactions, period, loading])

  const dailySummary = useMemo(() => calculateSummaryByPeriod(transactions, "daily"), [transactions])
  const weeklySummary = useMemo(() => calculateSummaryByPeriod(transactions, "weekly"), [transactions])
  const monthlySummary = useMemo(() => calculateSummaryByPeriod(transactions, "monthly", `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, "0")}`), [transactions, selectedMonth, selectedYear])
  const yearlySummary = useMemo(() => calculateSummaryByPeriod(transactions, "yearly"), [transactions])

  return (
    <div>
      <Tabs defaultValue="monthly" onValueChange={(v) => setPeriod(v as any)} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-foreground">Financial Summary</h2>
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </div>

        {period === "monthly" && (
          <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">Viewing data for</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(Number.parseInt(v))}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={month} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number.parseInt(v))}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <TabsContent value="daily" className="space-y-4 animate-fade-in">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard
              title="Income"
              amount={formatCurrency(dailySummary.income)}
              change=""
              isPositive={true}
              icon={DollarSign}
            />
            <SummaryCard
              title="Expenses"
              amount={formatCurrency(dailySummary.expenses)}
              change=""
              isPositive={false}
              icon={DollarSign}
            />
            <SummaryCard
              title="Balance"
              amount={formatCurrency(dailySummary.balance)}
              change=""
              isPositive={dailySummary.balance >= 0}
              icon={DollarSign}
            />
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4 animate-fade-in">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard
              title="Income"
              amount={formatCurrency(weeklySummary.income)}
              change=""
              isPositive={true}
              icon={DollarSign}
            />
            <SummaryCard
              title="Expenses"
              amount={formatCurrency(weeklySummary.expenses)}
              change=""
              isPositive={false}
              icon={DollarSign}
            />
            <SummaryCard
              title="Balance"
              amount={formatCurrency(weeklySummary.balance)}
              change=""
              isPositive={weeklySummary.balance >= 0}
              icon={DollarSign}
            />
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4 animate-fade-in">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard
              title="Income"
              amount={formatCurrency(monthlySummary.income)}
              change=""
              isPositive={true}
              icon={DollarSign}
            />
            <SummaryCard
              title="Expenses"
              amount={formatCurrency(monthlySummary.expenses)}
              change=""
              isPositive={false}
              icon={DollarSign}
            />
            <SummaryCard
              title="Balance"
              amount={formatCurrency(monthlySummary.balance)}
              change=""
              isPositive={monthlySummary.balance >= 0}
              icon={DollarSign}
            />
          </div>
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4 animate-fade-in">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard
              title="Income"
              amount={formatCurrency(yearlySummary.income)}
              change=""
              isPositive={true}
              icon={DollarSign}
            />
            <SummaryCard
              title="Expenses"
              amount={formatCurrency(yearlySummary.expenses)}
              change=""
              isPositive={false}
              icon={DollarSign}
            />
            <SummaryCard
              title="Balance"
              amount={formatCurrency(yearlySummary.balance)}
              change=""
              isPositive={yearlySummary.balance >= 0}
              icon={DollarSign}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SummaryCard({
  title,
  amount,
  change,
  isPositive,
  icon: Icon,
}: {
  title: string
  amount: string
  change: string
  isPositive: boolean
  icon: any
}) {
  return (
    <Card className="card-hover border-border/50 backdrop-blur-sm bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-primary/60" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-bold tracking-tight text-foreground">{amount}</div>
        {change && (
          <p className="text-xs flex items-center gap-1">
            {isPositive ? (
              <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            )}
            <span className={isPositive ? "text-emerald-500 font-semibold" : "text-red-500 font-semibold"}>
              {change}
            </span>
            <span className="text-muted-foreground">from last period</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
