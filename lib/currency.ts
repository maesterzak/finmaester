export const CURRENCIES = {
  USD: { symbol: "$", name: "US Dollar", rate: 1 },
  EUR: { symbol: "€", name: "Euro", rate: 0.92 },
  GBP: { symbol: "£", name: "British Pound", rate: 0.79 },
  JPY: { symbol: "¥", name: "Japanese Yen", rate: 149.5 },
  CAD: { symbol: "C$", name: "Canadian Dollar", rate: 1.36 },
  AUD: { symbol: "A$", name: "Australian Dollar", rate: 1.53 },
  CHF: { symbol: "CHF", name: "Swiss Franc", rate: 0.88 },
  INR: { symbol: "₹", name: "Indian Rupee", rate: 83.2 },
  MXN: { symbol: "$", name: "Mexican Peso", rate: 17.05 },
  SGD: { symbol: "S$", name: "Singapore Dollar", rate: 1.35 },
} as const

export type Currency = keyof typeof CURRENCIES

export function convertCurrency(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
  // Convert to USD first, then to target currency
  const amountInUSD = amount / CURRENCIES[fromCurrency].rate
  return amountInUSD * CURRENCIES[toCurrency].rate
}

export function formatCurrency(amount: number, currency: Currency): string {
  const { symbol } = CURRENCIES[currency]
  return `${symbol}${amount.toFixed(2)}`
}

export function getCurrencySymbol(currency: Currency): string {
  return CURRENCIES[currency].symbol
}

export function getCurrencyName(currency: Currency): string {
  return CURRENCIES[currency].name
}
