"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { format } from "date-fns"
import {
  AlertTriangle,
  Bot,
  Lightbulb,
  Loader2,
  PiggyBank,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { useTransactions } from "@/hooks/useTransactions"
import { useCategories } from "@/hooks/useCategories"
import { buildSpendingContext } from "@/lib/ai/context"
import type { ChatMessage, SpendingAnalysis } from "@/lib/ai/types"
import { formatCurrency, getActiveCurrency } from "@/lib/formatCurrency"
import { toDateKey } from "@/lib/periods"
import { cn } from "@/lib/utils"

const SUGGESTED_QUESTIONS = [
  "Where can I save money this month?",
  "Which expenses keep repeating?",
  "Am I spending more than last month?",
]

interface CachedAnalysis {
  fingerprint: string
  analysis: SpendingAnalysis
  generatedAt: string
}

// sessionStorage can throw in private mode, so every access is guarded
const readCache = (key: string): CachedAnalysis | null => {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as CachedAnalysis) : null
  } catch {
    return null
  }
}
const writeCache = (key: string, value: CachedAnalysis) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Caching is only a convenience
  }
}

export function AiAdvisor() {
  const { user } = useAuth()
  const { transactions, loading: transactionsLoading } = useTransactions()
  const { categories, loading: categoriesLoading } = useCategories()
  const dataLoading = transactionsLoading || categoriesLoading

  const [analysis, setAnalysis] = useState<SpendingAnalysis | null>(null)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)
  const [analysisFingerprint, setAnalysisFingerprint] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [replying, setReplying] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const context = useMemo(
    () => (dataLoading ? null : buildSpendingContext(transactions, categories)),
    [dataLoading, transactions, categories],
  )

  // Changes whenever the underlying data does, so a cached analysis is never stale
  const fingerprint = useMemo(
    () =>
      `${getActiveCurrency()}:${toDateKey(new Date())}:${transactions.length}:${transactions.reduce((s, t) => s + (Number(t.amount) || 0), 0)}`,
    [transactions],
  )
  const cacheKey = user ? `ai-analysis:${user.uid}` : null
  const isStale = !!analysis && analysisFingerprint !== fingerprint

  useEffect(() => {
    if (!cacheKey || dataLoading) return
    const cached = readCache(cacheKey)
    if (cached && cached.fingerprint === fingerprint) {
      setAnalysis(cached.analysis)
      setGeneratedAt(cached.generatedAt)
      setAnalysisFingerprint(cached.fingerprint)
    }
  }, [cacheKey, fingerprint, dataLoading])

  useEffect(() => {
    if (messages.length > 0) messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [messages, replying])

  const postToAi = async <T,>(path: string, body: object): Promise<T> => {
    if (!user) throw new Error("Please sign in again.")
    const token = await user.getIdToken()
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.")
    return data as T
  }

  const runAnalysis = async () => {
    if (!context || !cacheKey) return
    setAnalyzing(true)
    setError(null)
    try {
      const data = await postToAi<{ analysis: SpendingAnalysis; generatedAt: string }>("/api/ai/analyze", { context })
      setAnalysis(data.analysis)
      setGeneratedAt(data.generatedAt)
      setAnalysisFingerprint(fingerprint)
      writeCache(cacheKey, { fingerprint, analysis: data.analysis, generatedAt: data.generatedAt })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const sendMessage = async (text: string) => {
    const question = text.trim()
    if (!question || !context || replying) return
    const next: ChatMessage[] = [...messages, { role: "user", text: question }]
    setMessages(next)
    setInput("")
    setReplying(true)
    try {
      const data = await postToAi<{ reply: string }>("/api/ai/chat", { context, messages: next })
      setMessages([...next, { role: "model", text: data.reply }])
    } catch (e: any) {
      setMessages([...next, { role: "model", text: `⚠️ ${e.message}` }])
    } finally {
      setReplying(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const totalSavings = analysis?.suggestions.reduce((sum, s) => sum + s.estimatedMonthlySavings, 0) ?? 0

  return (
    <Card className="border-border/50 flex flex-col min-w-0">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg">AI Spending Coach</CardTitle>
              <CardDescription>Powered by Google Gemini</CardDescription>
            </div>
          </div>
          {analysis && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={runAnalysis}
              disabled={analyzing || !context}
              aria-label="Refresh analysis"
            >
              <RefreshCw className={cn("h-4 w-4", analyzing && "animate-spin")} />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="min-w-0 break-words">{error}</span>
          </div>
        )}

        {analyzing && !analysis ? (
          <AnalysisSkeleton />
        ) : !analysis ? (
          <div className="text-center py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Get an analysis of today, this week and this month, what your spending habits say about you, and
              specific ways to cut costs.
            </p>
            <Button onClick={runAnalysis} disabled={analyzing || dataLoading} className="w-full sm:w-auto gap-2">
              {analyzing || dataLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {dataLoading ? "Loading your data…" : "Analyze my spending"}
            </Button>
            <p className="flex items-start gap-1.5 text-left text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>
                Sends a summary to Google Gemini: totals, categories and budgets, plus the remarks of your largest and
                repeated expenses. Your full transaction list isn&apos;t sent.
              </span>
            </p>
          </div>
        ) : (
          <AnalysisView
            analysis={analysis}
            generatedAt={generatedAt}
            isStale={isStale}
            totalSavings={totalSavings}
            refreshing={analyzing}
          />
        )}

        {/* Follow-up chat */}
        <div className="space-y-3 border-t border-border/50 pt-4">
          <p className="text-sm font-medium">Ask a follow-up</p>

          {messages.length === 0 ? (
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  disabled={!context || replying}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors disabled:opacity-50 text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1">
              {messages.map((m, i) => (
                <ChatBubble key={i} message={m} />
              ))}
              {replying && (
                <div className="flex gap-2">
                  <BubbleAvatar role="model" />
                  <div className="rounded-lg bg-muted px-3 py-2.5">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="Ask about your spending…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!context || replying}
              maxLength={500}
              enterKeyHint="send"
            />
            <Button type="submit" size="icon" className="shrink-0" disabled={!context || replying || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

function AnalysisView({
  analysis,
  generatedAt,
  isStale,
  totalSavings,
  refreshing,
}: {
  analysis: SpendingAnalysis
  generatedAt: string | null
  isStale: boolean
  totalSavings: number
  refreshing: boolean
}) {
  return (
    <div className={cn("space-y-5 transition-opacity", refreshing && "opacity-60")}>
      <div className="space-y-1.5">
        <p className="text-sm leading-relaxed">{analysis.overview}</p>
        {generatedAt && (
          <p className="text-xs text-muted-foreground">
            Generated {format(new Date(generatedAt), "d MMM, h:mm a")}
            {isStale && " · your data has changed, refresh for an update"}
          </p>
        )}
      </div>

      {analysis.alerts.length > 0 && (
        <ul className="space-y-2">
          {analysis.alerts.map((alert, i) => (
            <li key={i} className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <span className="min-w-0 break-words">{alert}</span>
            </li>
          ))}
        </ul>
      )}

      <Tabs defaultValue="month">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="day" className="text-xs sm:text-sm">
            Today
          </TabsTrigger>
          <TabsTrigger value="week" className="text-xs sm:text-sm">
            This week
          </TabsTrigger>
          <TabsTrigger value="month" className="text-xs sm:text-sm">
            This month
          </TabsTrigger>
        </TabsList>
        {(["day", "week", "month"] as const).map((key) => (
          <TabsContent key={key} value={key} className="mt-3 space-y-2">
            <p className="text-sm font-medium">{analysis.periods[key].headline}</p>
            <ul className="space-y-1.5">
              {analysis.periods[key].points.map((point, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span className="min-w-0 break-words">{point}</span>
                </li>
              ))}
            </ul>
          </TabsContent>
        ))}
      </Tabs>

      {analysis.habits.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Your spending habits
          </p>
          <ul className="space-y-1.5">
            {analysis.habits.map((habit, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span className="min-w-0 break-words">{habit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.suggestions.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" /> Ways to cut costs
            </p>
            {totalSavings > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500">
                <PiggyBank className="h-3.5 w-3.5" /> Up to {formatCurrency(totalSavings)}/month
              </span>
            )}
          </div>
          <ul className="space-y-2">
            {analysis.suggestions.map((s, i) => (
              <li key={i} className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-1">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <p className="text-sm font-medium min-w-0 break-words">{s.title}</p>
                  {s.estimatedMonthlySavings > 0 && (
                    <span className="text-xs font-semibold text-emerald-500 whitespace-nowrap">
                      Save ~{formatCurrency(s.estimatedMonthlySavings)}/mo
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground break-words">{s.detail}</p>
                {s.category && s.category !== "General" && (
                  <p className="text-xs text-muted-foreground/80">{s.category}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function BubbleAvatar({ role }: { role: ChatMessage["role"] }) {
  return (
    <div
      className={cn(
        "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
        role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
      )}
    >
      {role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
    </div>
  )
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"
  // Gemini occasionally adds markdown emphasis despite instructions; show it as plain text
  const text = isUser ? message.text : message.text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^#+\s*/gm, "")
  return (
    <div className={cn("flex gap-2", isUser && "flex-row-reverse")}>
      <BubbleAvatar role={message.role} />
      <div
        className={cn(
          "rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words max-w-[85%] min-w-0",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {text}
      </div>
    </div>
  )
}

function AnalysisSkeleton() {
  return (
    <div className="space-y-3" aria-label="Analyzing your spending">
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Analyzing your spending…
      </p>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  )
}
