"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, Send, User } from "lucide-react"
import { useTransactions } from "@/hooks/useTransactions"
import { useSubscriptions } from "@/hooks/useSubscriptions"
import { formatCurrency } from "@/lib/formatCurrency"

type Message = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export function ChatbotWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your Finance Advice Bot. I can analyze your transactions and subscriptions to give you real-time tips. Ask me something like 'How is my spending looking?' or 'Tell me about my subscriptions'.",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { transactions } = useTransactions()
  const { subscriptions } = useSubscriptions()

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Generate response using actual data context
    setTimeout(() => {
      const query = input.toLowerCase()
      let reply = ""

      if (query.includes("spending") || query.includes("expense") || query.includes("cost") || query.includes("spent")) {
        const expenses = transactions.filter((t) => t.type === "expense")
        const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0)
        const categoryBreakdown = expenses.reduce((acc, t) => {
          const cat = t.categoryName || "Other"
          acc[cat] = (acc[cat] || 0) + t.amount
          return acc
        }, {} as Record<string, number>)

        const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]

        reply = `You have spent a total of ${formatCurrency(totalExpense)} across ${expenses.length} transaction(s).`
        if (topCategory) {
          reply += ` Your highest category of spending is "${topCategory[0]}" with a total of ${formatCurrency(topCategory[1])}.`
        }
        if (totalExpense > 50000) {
          reply += ` Consider reviewing your "${topCategory ? topCategory[0] : 'high spending'}" category to see where you can trim costs.`
        }
      } else if (query.includes("subscription") || query.includes("recurring") || query.includes("bill")) {
        const activeSubs = subscriptions.filter((s) => s.status === "active")
        const totalSubsCost = activeSubs.reduce((sum, s) => sum + s.amount, 0)
        const upcomingRenewals = activeSubs.filter(
          (s) => s.daysUntilRenewal !== undefined && s.daysUntilRenewal <= 7
        )

        reply = `You have ${activeSubs.length} active subscription(s) costing you ${formatCurrency(totalSubsCost)} per month.`
        if (upcomingRenewals.length > 0) {
          reply += ` You have ${upcomingRenewals.length} upcoming renewal(s) within the next 7 days: ${upcomingRenewals
            .map((r) => `${r.name} (${formatCurrency(r.amount)})`)
            .join(", ")}.`
        } else {
          reply += ` No renewals are scheduled within the next week.`
        }
      } else if (query.includes("income") || query.includes("salary") || query.includes("earn") || query.includes("deposit")) {
        const incomes = transactions.filter((t) => t.type === "income")
        const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0)
        reply = `Your total recorded income is ${formatCurrency(totalIncome)} across ${incomes.length} transaction(s).`
      } else if (query.includes("budget") || query.includes("limit") || query.includes("cap")) {
        reply = `You can configure and track your category budgets directly in the categories card. Make sure your budgets are lower than your monthly income to hit your savings goals!`
      } else {
        const generalTips = [
          "Based on your profile, we recommend saving at least 20% of your monthly income.",
          "Try setting up auto-save rules for your income to build up your emergency fund.",
          "Check your subscriptions list regularly — cancel any software or service you haven't used in the past 30 days.",
          "Nigerian bank stock dividends and mutual funds are good options for your monthly investment allocations.",
        ]
        reply = generalTips[Math.floor(Math.random() * generalTips.length)]
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: reply,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
      setIsLoading(false)
    }, 800)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Finance Advice Bot</CardTitle>
        <CardDescription>Get personalized financial advice</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-2 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {message.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg p-3 text-sm ${
                    message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.content}
                  <div
                    className={`text-xs mt-1 ${
                      message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[80%]">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg p-3 text-sm bg-muted">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-bounce"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Ask for financial advice..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
