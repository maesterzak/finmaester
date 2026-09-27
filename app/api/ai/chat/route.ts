import type { ChatMessage, SpendingContext } from "@/lib/ai/types"
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

const MAX_MESSAGES = 12
const MAX_MESSAGE_LENGTH = 1000

export async function POST(request: Request) {
  try {
    const uid = await requireUser(request)
    enforceRateLimit(`chat:${uid}`, 30, 10 * 60_000)

    const { context, messages } = await readJson<{ context: SpendingContext; messages: ChatMessage[] }>(request, 60_000)
    if (!context?.periods || !Array.isArray(messages) || messages.length === 0) {
      throw new AiError("Invalid request.", 400)
    }

    // Keep the latest turns, starting with a user message as Gemini expects
    const history = messages
      .filter((m) => (m.role === "user" || m.role === "model") && typeof m.text === "string" && m.text.trim())
      .slice(-MAX_MESSAGES)
      .map((m) => ({ role: m.role, parts: [{ text: m.text.slice(0, MAX_MESSAGE_LENGTH) }] }))
    while (history.length && history[0].role !== "user") history.shift()
    if (!history.length || history[history.length - 1].role !== "user") throw new AiError("Invalid request.", 400)

    const reply = await callGemini({
      system: `${COACH_INSTRUCTIONS}
Answer the user's question about their finances in under 150 words.
Write plain text only: no markdown headings, bold or tables. Use "- " for bullet points when listing.
If the question isn't about their money, gently steer back to personal finance.

The user's financial data (JSON):
${JSON.stringify(context)}`,
      contents: history,
      temperature: 0.5,
    })

    return Response.json({ reply: reply.trim() })
  } catch (error) {
    return errorResponse(error)
  }
}
