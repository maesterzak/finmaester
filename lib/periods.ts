import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns"

export type PeriodType = "day" | "week" | "month" | "year" | "custom"

export const PERIOD_OPTIONS: { value: PeriodType; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "custom", label: "Custom" },
]

// Weeks run Sunday → Saturday
export const WEEK_STARTS_ON = 0 as const

// Inclusive range of "yyyy-MM-dd" keys. Transactions store dates in this format,
// so ranges are compared as strings to avoid timezone shifts from new Date("yyyy-MM-dd").
export interface DateRange {
  start: string
  end: string
}

export const toDateKey = (date: Date) => format(date, "yyyy-MM-dd")

// Parses "yyyy-MM-dd" (or a longer ISO string) as a local date
export const fromDateKey = (key: string) => parseISO(key.slice(0, 10))

export const isValidDateKey = (key?: string | null): key is string =>
  !!key && /^\d{4}-\d{2}-\d{2}$/.test(key) && isValid(parseISO(key))

export const monthKeyOf = (date: Date) => format(date, "yyyy-MM")

export function getPeriodRange(period: PeriodType, anchor: Date, custom?: DateRange): DateRange {
  switch (period) {
    case "day":
      return { start: toDateKey(anchor), end: toDateKey(anchor) }
    case "week":
      return {
        start: toDateKey(startOfWeek(anchor, { weekStartsOn: WEEK_STARTS_ON })),
        end: toDateKey(endOfWeek(anchor, { weekStartsOn: WEEK_STARTS_ON })),
      }
    case "month":
      return { start: toDateKey(startOfMonth(anchor)), end: toDateKey(endOfMonth(anchor)) }
    case "year":
      return { start: toDateKey(startOfYear(anchor)), end: toDateKey(endOfYear(anchor)) }
    case "custom":
      if (custom && custom.start <= custom.end) return custom
      return { start: toDateKey(startOfMonth(anchor)), end: toDateKey(endOfMonth(anchor)) }
  }
}

export function shiftAnchor(period: PeriodType, anchor: Date, direction: 1 | -1): Date {
  switch (period) {
    case "day":
      return addDays(anchor, direction)
    case "week":
      return addWeeks(anchor, direction)
    case "month":
    case "custom":
      return addMonths(anchor, direction)
    case "year":
      return addYears(anchor, direction)
  }
}

export const rangeLengthInDays = (range: DateRange) =>
  differenceInCalendarDays(fromDateKey(range.end), fromDateKey(range.start)) + 1

// The period immediately before `range`, used for "vs previous period" comparisons
export function getPreviousRange(period: PeriodType, range: DateRange): DateRange {
  const start = fromDateKey(range.start)
  if (period === "custom") {
    const length = rangeLengthInDays(range)
    return { start: toDateKey(addDays(start, -length)), end: toDateKey(addDays(start, -1)) }
  }
  return getPeriodRange(period, shiftAnchor(period, start, -1))
}

export function formatPeriodLabel(period: PeriodType, range: DateRange): string {
  const start = fromDateKey(range.start)
  const end = fromDateKey(range.end)
  switch (period) {
    case "day":
      return format(start, "EEE, d MMM yyyy")
    case "month":
      return format(start, "MMMM yyyy")
    case "year":
      return format(start, "yyyy")
    case "week":
    case "custom":
      if (range.start === range.end) return format(start, "d MMM yyyy")
      if (start.getFullYear() !== end.getFullYear()) {
        return `${format(start, "d MMM yyyy")} – ${format(end, "d MMM yyyy")}`
      }
      return `${format(start, "d MMM")} – ${format(end, "d MMM yyyy")}`
  }
}

export const previousPeriodLabel: Record<PeriodType, string> = {
  day: "yesterday",
  week: "last week",
  month: "last month",
  year: "last year",
  custom: "previous period",
}

export const isInRange = (dateKey: string, range: DateRange) => {
  const key = dateKey.slice(0, 10)
  return key >= range.start && key <= range.end
}

export const eachDayKey = (range: DateRange) =>
  eachDayOfInterval({ start: fromDateKey(range.start), end: fromDateKey(range.end) }).map(toDateKey)

export const eachMonthKey = (range: DateRange) =>
  eachMonthOfInterval({ start: fromDateKey(range.start), end: fromDateKey(range.end) }).map(monthKeyOf)
