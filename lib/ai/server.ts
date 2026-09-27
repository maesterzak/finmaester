// Server-only helpers for the /api/ai routes. Never import this from client components:
// it reads GEMINI_API_KEY, which must stay on the server.

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models"
const DEFAULT_MODEL = "gemini-3.8-flash"

export class AiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
  }
}

export const isAiConfigured = () => !!process.env.GEMINI_API_KEY

// ---------- Auth ----------

const verifiedTokens = new Map<string, { uid: string; expires: number }>()

// Verifies a Firebase ID token with Google's Identity Toolkit, so only signed-in users can spend the AI quota
export async function requireUser(request: Request): Promise<string> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
  if (!token) throw new AiError("Please sign in again.", 401)

  const cached = verifiedTokens.get(token)
  if (cached && cached.expires > Date.now()) return cached.uid

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: token }),
  })
  const uid: string | undefined = res.ok ? (await res.json()).users?.[0]?.localId : undefined
  if (!uid) throw new AiError("Your session has expired. Please sign in again.", 401)

  verifiedTokens.set(token, { uid, expires: Date.now() + 5 * 60_000 })
  if (verifiedTokens.size > 500) verifiedTokens.delete(verifiedTokens.keys().next().value!)
  return uid
}

// ---------- Rate limiting (per server instance) ----------

const usage = new Map<string, number[]>()

export function enforceRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const recent = (usage.get(key) || []).filter((t) => now - t < windowMs)
  if (recent.length >= limit) {
    throw new AiError("You've made a lot of AI requests. Please wait a few minutes and try again.", 429)
  }
  recent.push(now)
  usage.set(key, recent)
}

// ---------- Request parsing ----------

export async function readJson<T>(request: Request, maxBytes = 40_000): Promise<T> {
  const text = await request.text()
  if (text.length > maxBytes) throw new AiError("Request is too large.", 413)
  try {
    return JSON.parse(text) as T
  } catch {
    throw new AiError("Invalid request.", 400)
  }
}

// ---------- Gemini ----------

interface GeminiRequest {
  system: string
  contents: { role: "user" | "model"; parts: { text: string }[] }[]
  responseSchema?: object
  temperature?: number
}

export async function callGemini({ system, contents, responseSchema, temperature = 0.4 }: GeminiRequest): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new AiError("The AI advisor isn't set up yet (missing GEMINI_API_KEY).", 503)
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL

  const res = await fetch(`${GEMINI_ENDPOINT}/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: 8192,
        ...(responseSchema ? { responseMimeType: "application/json", responseSchema } : {}),
      },
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    console.error(`Gemini ${res.status}: ${detail.slice(0, 500)}`)
    if (res.status === 429) {
      throw new AiError("The free AI quota is used up for now. Please try again in a minute.", 429)
    }
    if (res.status === 400 || res.status === 403 || res.status === 404) {
      throw new AiError("The AI service rejected the request. Check GEMINI_API_KEY and GEMINI_MODEL.", 502)
    }
    throw new AiError("The AI service is unavailable right now. Please try again.", 502)
  }

  const data = await res.json()
  const candidate = data.candidates?.[0]
  const text: string = (candidate?.content?.parts || [])
    .filter((p: { text?: string; thought?: boolean }) => p.text && !p.thought)
    .map((p: { text: string }) => p.text)
    .join("")

  if (!text) {
    const reason = candidate?.finishReason || data.promptFeedback?.blockReason || "unknown"
    console.error(`Gemini returned no text (reason: ${reason})`)
    throw new AiError("The AI couldn't produce an answer. Please try again.", 502)
  }
  return text
}

export function errorResponse(error: unknown) {
  if (error instanceof AiError) {
    return Response.json({ error: error.message }, { status: error.status })
  }
  console.error(error)
  return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 })
}

export const COACH_INSTRUCTIONS = `You are a friendly, practical personal finance coach.
All amounts are in the currency given by the "currency" field of the data (an ISO 4217 code). Write amounts with that currency's usual symbol and thousands separators, e.g. $12,500 for USD or ₦12,500 for NGN.
Use ONLY the data provided. Never invent transactions, categories or amounts.
Be specific: mention the actual categories, remarks and amounts behind each observation.
Savings advice must be realistic and practical, and based on what the data actually shows (e.g. transport, food, subscriptions, phone and data plans, eating out).
If a period has no transactions, say so briefly instead of guessing.
"Repeated expenses" are remarks seen 3+ times in the last 90 days and are good candidates for cutting or renegotiating.`
