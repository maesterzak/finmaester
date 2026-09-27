// Currency formatting utility
// Default to Naira (₦)
export const formatCurrency = (amount: number): string => {
  return `₦${amount.toFixed(2)}`
}

export const formatCurrencyNoDecimals = (amount: number): string => {
  return `₦${Math.round(amount)}`
}



// Short form for chart axes, e.g. ₦12.5k, ₦1.2M
export const formatCurrencyCompact = (amount: number): string => {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? "-" : ""
  if (abs >= 1_000_000) return `${sign}₦${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`
  if (abs >= 1_000) return `${sign}₦${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`
  return `${sign}₦${Math.round(abs)}`
}
