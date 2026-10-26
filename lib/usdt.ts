// Crypto cards are tracked in USDT. Purchases store the USDT amount and the rate used,
// plus the converted amount in the user's currency so totals and targets keep working.

const usdtFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 2 })

export const formatUsdt = (amount: number) => `${usdtFormatter.format(Number.isFinite(amount) ? amount : 0)} USDT`

// Two decimals is enough for naira/USDT amounts; avoids float noise like 1332.5600000001
export const usdtToLocal = (usdt: number, rate: number) => Math.round(usdt * rate * 100) / 100
