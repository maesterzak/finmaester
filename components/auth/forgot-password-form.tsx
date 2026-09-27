"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { CheckCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toastError } from "@/lib/toast"
import { useAuth } from "@/contexts/AuthContext"

export function ForgotPasswordForm() {
  const { resetPasswordEmail } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get("email") || "").trim()
    if (!email) return
    setIsLoading(true)
    const result = await resetPasswordEmail(email)
    setIsLoading(false)
    if (result.success) setSentTo(email)
    else toastError(result.error || "Couldn't send the reset email. Check the address and try again.")
  }

  if (sentTo) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Check your inbox</h3>
          <p className="text-sm text-muted-foreground">
            If an account exists for <span className="font-medium text-foreground break-all">{sentTo}</span>, we&apos;ve
            sent a link to reset your password. It can take a minute; check your spam folder too.
          </p>
        </div>
        <div className="grid gap-2">
          <Button asChild className="w-full">
            <Link href="/auth/login">Back to log in</Link>
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setSentTo(null)}>
            Use a different email
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            disabled={isLoading}
            className="pl-10"
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending link…" : "Send reset link"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  )
}
