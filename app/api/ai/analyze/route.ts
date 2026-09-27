import type { SpendingAnalysis, SpendingContext } from "@/lib/ai/types"
import {
  AiError,
  COACH_INSTRUCTIONS,
  callGemini,
  enforceRateLimit,
  errorResponse,
  readJson,
  requireUser,
} from "@/lib/ai/server"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const insightSchema = {
  type: "OBJECT",
  properties: {
    headline: { type: "STRING", description: "One sentence summary of this period" },
    points: { type: "ARRAY", items: { type: "STRING" }, description: "2-4 specific observations" },
  },
  required: ["headline", "points"],
}

const analysisSchema = {
  type: "OBJECT",
  properties: {
    overview: { type: "STRING", description: "2-3 sentence overall picture of the user's finances" },
    periods: {
      type: "OBJECT",
      properties: { day: insightSchema, week: insightSchema, month: insightSchema },
      required: ["day", "week", "month"],
    },
    habits: { type: "ARRAY", items: { type: "STRING" }, description: "3-5 spending habits seen in the data" },
    suggestions: {
      type: "ARRAY",
      description: "3-6 concrete ways to cut costs, biggest impact first",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          detail: { type: "STRING", description: "What to do and why, referencing the data" },
          category: { type: "STRING", description: "Related category, or General" },
          estimatedMonthlySavings: { type: "NUMBER", description: "Realistic monthly saving in the user's currency, 0 if unknown" },
        },
        required: ["title", "detail", "category", "estimatedMonthlySavings"],
      },
    },
    alerts: { type: "ARRAY", items: { type: "STRING" }, description: "Urgent issues such as over-budget categories; empty if none" },
  },
  required: ["overview", "periods", "habits", "suggestions", "alerts"],
}

const strings = (value: unknown) => (Array.isArray(value) ? value.filter((v) => typeof v === "string") : [])

function normalize(raw: any): SpendingAnalysis {
  const insight = (p: any) => ({ headline: String(p?.headline ?? ""), points: strings(p?.points) })
  return {
    overview: String(raw?.overview ?? ""),
    periods: { day: insight(raw?.periods?.day), week: insight(raw?.periods?.week), month: insight(raw?.periods?.month) },
    habits: strings(raw?.habits),
    suggestions: (Array.isArray(raw?.suggestions) ? raw.suggestions : []).map((s: any) => ({
      title: String(s?.title ?? ""),
      detail: String(s?.detail ?? ""),
      category: String(s?.category ?? "General"),
      estimatedMonthlySavings: Math.max(0, Number(s?.estimatedMonthlySavings) || 0),
    })),
    alerts: strings(raw?.alerts),
  }
}

export async function POST(request: Request) {
  try {
    const uid = await requireUser(request)
    enforceRateLimit(`analyze:${uid}`, 6, 10 * 60_000)

    const { context } = await readJson<{ context: SpendingContext }>(request)
    if (!context?.periods?.day || !context.periods.week || !context.periods.month) {
      throw new AiError("Invalid request.", 400)
    }

    const text = await callGemini({
      system: COACH_INSTRUCTIONS,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Analyze my spending for today, this week and this month. Describe my spending habits and suggest specific ways to cut costs.\n\nMy financial data (JSON):\n${JSON.stringify(context)}`,
            },
          ],
        },
      ],
      responseSchema: analysisSchema,
    })

    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      throw new AiError("The AI returned an unexpected answer. Please try again.", 502)
    }

    return Response.json({ analysis: normalize(parsed), generatedAt: new Date().toISOString() })
  } catch (error) {
    return errorResponse(error)
  }
}
