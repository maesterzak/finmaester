import { DEFAULT_CURRENCY } from "@/lib/currency"

// Money formatting in the signed-in user's chosen currency.
// CurrencyProvider sets the active currency once it's loaded and re-renders the app when it changes,
// so components can keep calling these plain functions.

let activeCurrency: string = DEFAULT_CURRENCY

export const setActiveCurrency = (code: string) => {
  activeCurrency = code
}

export const getActiveCurrency = () => activeCurrency

const formatters = new Map<string, Intl.NumberFormat>()

function formatter(currency: string, variant: "whole" | "exact" | "compact") {
  const key = `${currency}:${variant}`
  let f = formatters.get(key)
  if (!f) {
    const base: Intl.NumberFormatOptions = { style: "currency", currency, currencyDisplay: "narrowSymbol" }
    f = new Intl.NumberFormat(
      "en",
      variant === "whole"
        ? { ...base, maximumFractionDigits: 0, minimumFractionDigits: 0 }
        : variant === "compact"
          ? { ...base, notation: "compact", maximumFractionDigits: 1 }
          : base, // the currency's own decimals, e.g. 2 for USD, 0 for JPY
    )
    formatters.set(key, f)
  }
  return f
}

const clean = (amount: number) => (Number.isFinite(amount) ? amount : 0)

// $300,000 for whole amounts, $1,250.50 when there are cents
export const formatCurrency = (amount: number, currency: string = activeCurrency): string => {
  const value = clean(amount)
  const hasCents = Math.round(Math.abs(value) * 100) % 100 !== 0
  return formatter(currency, hasCents ? "exact" : "whole").format(value)
}

export const formatCurrencyNoDecimals = (amount: number, currency: string = activeCurrency): string =>
  formatter(currency, "whole").format(Math.round(clean(amount)))

// Short form for chart axes, e.g. $12.5K, $1.2M
export const formatCurrencyCompact = (amount: number, currency: string = activeCurrency): string =>
  formatter(currency, "compact").format(clean(amount))

// The symbol shown in amount inputs, e.g. "$", "₦", "€"
export const currencySymbol = (currency: string = activeCurrency): string =>
  formatter(currency, "whole")
    .formatToParts(0)
    .find((p) => p.type === "currency")?.value ?? currency

// Left padding for an amount input with the currency symbol drawn inside it
export const symbolInputPadding = (currency: string = activeCurrency) => ({
  paddingLeft: `${1.1 + currencySymbol(currency).length * 0.55}rem`,
})
