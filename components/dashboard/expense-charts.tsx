"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart"
import { getExpensesLast30Days, getIncomeVsExpenseLast12Months } from "@/lib/firebase/firestore"

export function ExpenseCharts({transactions}: {transactions:any[]}) {
  // Mock data - in a real app, this would come from your API
  const monthlyData = getIncomeVsExpenseLast12Months(transactions)
  

  const categoryData = [
    { name: "Investment", value: 25, color: "#8884d8" },
    { name: "Savings", value: 15, color: "#82ca9d" },
    { name: "Transport", value: 20, color: "#ffc658" },
    { name: "Education", value: 15, color: "#ff8042" },
    { name: "Personal", value: 25, color: "#0088fe" },
  ]

 

  const dailyData  = getExpensesLast30Days(transactions)

  return (
    <Card className="card-hover border-border/50 backdrop-blur-sm bg-card/80 animate-slide-in">
      <CardHeader className="pb-3 md:pb-6">
        <CardTitle className="text-xl md:text-2xl font-bold">Expense Analysis</CardTitle>
      </CardHeader>
      <CardContent className="pt-2 md:pt-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-6">
            <TabsTrigger value="overview" className="text-xs md:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs md:text-sm">
              Categories
            </TabsTrigger>
            <TabsTrigger value="daily" className="text-xs md:text-sm">
              Daily
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 animate-fade-in">
            <div className="h-[300px] md:h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(156, 100%, 40%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(156, 100%, 40%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(20, 8%, 20%)" />
                  <XAxis dataKey="name" stroke="hsl(0, 0%, 70%)" style={{ fontSize: "12px" }} />
                  <YAxis stroke="hsl(0, 0%, 70%)" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(15, 20%, 12%)",
                      border: "1px solid hsl(20, 8%, 20%)",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="hsl(156, 100%, 40%)"
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="hsl(0, 84%, 60%)"
                    fillOpacity={1}
                    fill="url(#colorExpenses)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-4 animate-fade-in">
            <div className="h-[300px] md:h-[400px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="hsl(156, 100%, 40%)"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(15, 20%, 12%)",
                      border: "1px solid hsl(20, 8%, 20%)",
                      borderRadius: "0.5rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="daily" className="mt-4 animate-fade-in">
            <div className="h-[300px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(20, 8%, 20%)" />
                  <XAxis dataKey="name" stroke="hsl(0, 0%, 70%)" style={{ fontSize: "12px" }} />
                  <YAxis stroke="hsl(0, 0%, 70%)" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(15, 20%, 12%)",
                      border: "1px solid hsl(20, 8%, 20%)",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar dataKey="expense" fill="hsl(156, 100%, 40%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-center text-sm">Daily data for past 30 days</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
