// Live price of 1 USDT in the requested currency, e.g. /api/rates/usdt?currency=NGN.
// Fetched server-side from CoinGecko and cached for 5 minutes so every client shares one upstream call.

const COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price"
const CACHE_SECONDS = 300

export async function GET(request: Request) {
  const currency = (new URL(request.url).searchParams.get("currency") || "NGN").toUpperCase()
  if (!/^[A-Z]{3}$/.test(currency)) {
    return Response.json({ error: "Invalid currency." }, { status: 400 })
  }

  try {
    const res = await fetch(`${COINGECKO_URL}?ids=tether&vs_currencies=${currency.toLowerCase()}`, {
      next: { revalidate: CACHE_SECONDS },
    })
    if (!res.ok) throw new Error(`CoinGecko responded ${res.status}`)
    const data = await res.json()
    const rate = Number(data?.tether?.[currency.toLowerCase()])
    if (!Number.isFinite(rate) || rate <= 0) {
      return Response.json({ error: `No USDT rate for ${currency}.` }, { status: 404 })
    }
    return Response.json(
      { currency, rate, fetchedAt: new Date().toISOString() },
      { headers: { "Cache-Control": `public, max-age=60, s-maxage=${CACHE_SECONDS}` } },
    )
  } catch {
    return Response.json({ error: "Couldn't fetch the USDT rate right now." }, { status: 502 })
  }
}
