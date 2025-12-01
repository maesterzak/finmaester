// Currency formatting utility
// Default to Naira (₦)
export const formatCurrency = (amount: number): string => {
  return `₦${amount.toFixed(2)}`
}

export const formatCurrencyNoDecimals = (amount: number): string => {
  return `₦${Math.round(amount)}`
}


