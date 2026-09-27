"use client"

import { useCallback, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  type DateRange,
  type PeriodType,
  PERIOD_OPTIONS,
  formatPeriodLabel,
  fromDateKey,
  getPeriodRange,
  getPreviousRange,
  isValidDateKey,
  shiftAnchor,
  toDateKey,
} from "@/lib/periods"

// Period, date and category filters live in the URL so views can be shared, refreshed and linked to
export function usePeriodFilter(defaultPeriod: PeriodType = "month") {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const periodParam = searchParams.get("period") as PeriodType | null
  const period = PERIOD_OPTIONS.some((p) => p.value === periodParam) ? periodParam! : defaultPeriod

  const dateParam = searchParams.get("date")
  const anchorKey = isValidDateKey(dateParam) ? dateParam : toDateKey(new Date())
  const anchor = useMemo(() => fromDateKey(anchorKey), [anchorKey])

  const fromParam = searchParams.get("from")
  const toParam = searchParams.get("to")
  const customRange: DateRange | undefined =
    isValidDateKey(fromParam) && isValidDateKey(toParam) && fromParam <= toParam
      ? { start: fromParam, end: toParam }
      : undefined

  const categoryId = searchParams.get("category") || "all"

  const range = useMemo(
    () => getPeriodRange(period, anchor, customRange),
    // customRange is rebuilt every render, so depend on its primitive parts
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [period, anchor, customRange?.start, customRange?.end],
  )
  const previousRange = useMemo(() => getPreviousRange(period, range), [period, range])
  const label = formatPeriodLabel(period, range)

  const update = useCallback(
    (changes: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(changes).forEach(([key, value]) => {
        if (value === null) params.delete(key)
        else params.set(key, value)
      })
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  const setPeriod = (next: PeriodType) => {
    if (next === "custom") {
      // Start the custom range from whatever is currently on screen
      update({ period: next, from: range.start, to: range.end })
    } else {
      update({ period: next, from: null, to: null })
    }
  }

  const shift = (direction: 1 | -1) => update({ date: toDateKey(shiftAnchor(period, anchor, direction)) })

  const goToToday = () => update({ date: null })

  const setCustomRange = (next: DateRange) => update({ period: "custom", from: next.start, to: next.end })

  const setCategoryId = (id: string) => update({ category: id === "all" ? null : id })

  const todayKey = toDateKey(new Date())
  const includesToday = range.start <= todayKey && todayKey <= range.end

  return {
    period,
    anchor,
    range,
    previousRange,
    label,
    includesToday,
    categoryId,
    setPeriod,
    shift,
    goToToday,
    setCustomRange,
    setCategoryId,
  }
}

export type PeriodFilterState = ReturnType<typeof usePeriodFilter>
