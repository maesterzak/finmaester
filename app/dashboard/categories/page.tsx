"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CategoryList } from "@/components/categories/category-list"
import { AddCategoryButton } from "@/components/categories/add-category-button"
import { CalendarDays } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

// Generate year options (current year and 2 years back)
const currentYear = new Date().getFullYear()
const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]

export default function CategoriesPage() {
  const [triggerAdd, setTriggerAdd] = useState(0)
  const currentMonth = new Date().getMonth()
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)

  return (
    <div className="container mx-auto p-4 md:p-6">
      <DashboardHeader
        title="Categories"
        description="Manage your expense categories"
        action={<AddCategoryButton onClick={() => setTriggerAdd(prev => prev + 1)} />}
      />
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-card rounded-xl border border-border/50">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span className="text-sm font-medium">Budget Period:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={month} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number.parseInt(value))}>
            <SelectTrigger className="w-[100px] bg-background">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto text-sm text-muted-foreground hidden sm:block">
          Showing budgets for{" "}
          <span className="font-semibold text-foreground">
            {months[selectedMonth]} {selectedYear}
          </span>
        </div>
      </div>
      <CategoryList triggerAdd={triggerAdd} selectedMonth={selectedMonth} selectedYear={selectedYear} />
    </div>
  )
}
