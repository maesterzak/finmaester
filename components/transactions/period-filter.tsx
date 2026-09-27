"use client"

import type React from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PeriodFilterState } from "@/hooks/usePeriodFilter"
import { PERIOD_OPTIONS, type PeriodType, isValidDateKey } from "@/lib/periods"

interface PeriodFilterProps {
  filter: PeriodFilterState
  children?: React.ReactNode
}

export function PeriodFilter({ filter, children }: PeriodFilterProps) {
  const { period, range, label, includesToday, setPeriod, shift, goToToday, setCustomRange } = filter

  const handleFromChange = (value: string) => {
    if (!isValidDateKey(value)) return
    setCustomRange({ start: value, end: value > range.end ? value : range.end })
  }

  const handleToChange = (value: string) => {
    if (!isValidDateKey(value)) return
    setCustomRange({ start: value < range.start ? value : range.start, end: value })
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">Filter by Period</span>
          </div>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as PeriodType)} className="w-full lg:w-auto">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto">
              {PERIOD_OPTIONS.map((option) => (
                <TabsTrigger key={option.value} value={option.value} className="text-xs sm:text-sm">
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {period === "custom" ? (
          <div className="grid grid-cols-2 gap-3 mt-4 sm:max-w-md">
            <div className="grid gap-1.5">
              <Label htmlFor="period-from" className="text-xs text-muted-foreground">
                From
              </Label>
              <Input
                id="period-from"
                type="date"
                value={range.start}
                max={range.end}
                onChange={(e) => handleFromChange(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="period-to" className="text-xs text-muted-foreground">
                To
              </Label>
              <Input
                id="period-to"
                type="date"
                value={range.end}
                min={range.start}
                onChange={(e) => handleToChange(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 mt-4">
            <Button variant="outline" size="icon" onClick={() => shift(-1)} aria-label="Previous period">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 text-center">
              <p className="font-semibold text-foreground">{label}</p>
              {!includesToday && (
                <button
                  type="button"
                  onClick={goToToday}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Back to today
                </button>
              )}
            </div>
            <Button variant="outline" size="icon" onClick={() => shift(1)} aria-label="Next period">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {children && <div className="mt-4 pt-4 border-t border-border/50">{children}</div>}
      </CardContent>
    </Card>
  )
}
