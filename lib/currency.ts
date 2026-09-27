// Currencies a user can choose to record and view their money in.
// Amounts are stored as plain numbers in the user's chosen currency; switching currency relabels, it doesn't convert.

export const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "NGN", name: "Nigerian Naira" },
  { code: "GHS", name: "Ghanaian Cedi" },
  { code: "KES", name: "Kenyan Shilling" },
  { code: "ZAR", name: "South African Rand" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "XOF", name: "West African CFA Franc" },
  { code: "XAF", name: "Central African CFA Franc" },
  { code: "MAD", name: "Moroccan Dirham" },
  { code: "UGX", name: "Ugandan Shilling" },
  { code: "TZS", name: "Tanzanian Shilling" },
  { code: "RWF", name: "Rwandan Franc" },
  { code: "ETB", name: "Ethiopian Birr" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "ARS", name: "Argentine Peso" },
  { code: "COP", name: "Colombian Peso" },
  { code: "CLP", name: "Chilean Peso" },
  { code: "INR", name: "Indian Rupee" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "BDT", name: "Bangladeshi Taka" },
  { code: "LKR", name: "Sri Lankan Rupee" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "KRW", name: "South Korean Won" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "THB", name: "Thai Baht" },
  { code: "VND", name: "Vietnamese Dong" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "QAR", name: "Qatari Riyal" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "ILS", name: "Israeli New Shekel" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "DKK", name: "Danish Krone" },
  { code: "PLN", name: "Polish Złoty" },
  { code: "UAH", name: "Ukrainian Hryvnia" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "NZD", name: "New Zealand Dollar" },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]["code"]

export const DEFAULT_CURRENCY: CurrencyCode = "USD"

export const isSupportedCurrency = (code: unknown): code is CurrencyCode =>
  typeof code === "string" && CURRENCIES.some((c) => c.code === code)

export const currencyName = (code: string) => CURRENCIES.find((c) => c.code === code)?.name ?? code

// Best guess for someone who hasn't chosen yet, from their browser's region (e.g. en-GB → GBP)
const REGION_CURRENCY: Record<string, CurrencyCode> = {
  US: "USD", GB: "GBP", NG: "NGN", GH: "GHS", KE: "KES", ZA: "ZAR", EG: "EGP", MA: "MAD", UG: "UGX",
  TZ: "TZS", RW: "RWF", ET: "ETB", SN: "XOF", CI: "XOF", BJ: "XOF", TG: "XOF", ML: "XOF", BF: "XOF",
  NE: "XOF", CM: "XAF", GA: "XAF", CA: "CAD", MX: "MXN", BR: "BRL", AR: "ARS", CO: "COP", CL: "CLP",
  IN: "INR", PK: "PKR", BD: "BDT", LK: "LKR", CN: "CNY", JP: "JPY", KR: "KRW", ID: "IDR", MY: "MYR",
  PH: "PHP", SG: "SGD", TH: "THB", VN: "VND", AE: "AED", SA: "SAR", QA: "QAR", TR: "TRY", IL: "ILS",
  CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN", UA: "UAH", AU: "AUD", NZ: "NZD",
  DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", NL: "EUR", BE: "EUR", PT: "EUR", IE: "EUR", AT: "EUR",
  FI: "EUR", GR: "EUR", LU: "EUR", SK: "EUR", SI: "EUR", LT: "EUR", LV: "EUR", EE: "EUR", HR: "EUR",
}

export function guessCurrencyFromLocale(): CurrencyCode {
  if (typeof navigator === "undefined") return DEFAULT_CURRENCY
  for (const locale of navigator.languages ?? [navigator.language]) {
    const region = locale.split("-")[1]?.toUpperCase()
    if (region && REGION_CURRENCY[region]) return REGION_CURRENCY[region]
  }
  return DEFAULT_CURRENCY
}
