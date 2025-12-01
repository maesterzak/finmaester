"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toastSuccess, toastError } from "@/lib/toast"
import { Mail, Phone, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function ForgotPasswordForm() {
  const { resetPasswordEmail } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleEmailReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string

    const result = await resetPasswordEmail(email)

    setIsLoading(false)

    if (result.success) {
      setIsSuccess(true)
      toastSuccess("Reset link sent! Check your email for a link to reset your password.")
    } else {
      toastError(result.error || "Failed to send reset email")
    }
  }

  const handlePhoneReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Phone password reset is more complex and requires additional setup
    // For now, we'll show a message
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
      toastError("Phone reset not available. Please use email to reset your password.")
    }, 500)
  }

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Check your inbox</h3>
          <p className="text-muted-foreground">
            We&apos;ve sent you a password reset link. Please check your email or phone for instructions.
          </p>
        </div>
        <Button className="w-full" onClick={() => setIsSuccess(false)}>
          Back to reset options
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="phone">Phone</TabsTrigger>
        </TabsList>
        <TabsContent value="email" className="space-y-4">
          <form onSubmit={handleEmailReset}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending reset link..." : "Send Reset Link"}
              </Button>
            </div>
          </form>
        </TabsContent>
        <TabsContent value="phone" className="space-y-4">
          <form onSubmit={handlePhoneReset}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                    autoCapitalize="none"
                    autoComplete="tel"
                    autoCorrect="off"
                    disabled={isLoading}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending verification code..." : "Send Verification Code"}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
