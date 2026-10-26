"use client"

import { useEffect, useState } from "react"
import { getActiveCurrency } from "@/lib/formatCurrency"

const REFRESH_MS = 5 * 60_000

// Shared across components so the rate is fetched once per currency every few minutes
const cache = new Map<string, { rate: number; at: number; pending?: Promise<number | null> }>()

async function fetchRate(currency: string): Promise<number | null> {
  const cached = cache.get(currency)
  if (cached?.pending) return cached.pending
  if (cached && Date.now() - cached.at < REFRESH_MS) return cached.rate

  const pending = fetch(`/api/rates/usdt?currency=${currency}`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      const rate = typeof data?.rate === "number" ? data.rate : null
      if (rate) cache.set(currency, { rate, at: Date.now() })
      else cache.delete(currency)
      return rate
    })
    .catch(() => {
      cache.delete(currency)
      return null
    })
  cache.set(currency, { rate: cached?.rate ?? 0, at: cached?.at ?? 0, pending })
  return pending
}

// Live price of 1 USDT in the user's currency (e.g. ₦ per USDT). null while loading or if unavailable.
export function useUsdtRate() {
  const currency = getActiveCurrency()
  const [rate, setRate] = useState<number | null>(() => {
    const cached = cache.get(currency)
    return cached && cached.rate > 0 ? cached.rate : null
  })
  const [loading, setLoading] = useState(rate === null)

  useEffect(() => {
    let active = true
    const load = () =>
      fetchRate(currency).then((r) => {
        if (!active) return
        if (r) setRate(r)
        setLoading(false)
      })
    load()
    const timer = setInterval(load, REFRESH_MS)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [currency])

  return { rate, loading, currency }
}
