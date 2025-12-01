"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toastSuccess, toastError } from "@/lib/toast"
import { Mail, Lock, Phone, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { createRecaptchaVerifier, sendPhoneVerificationCode, verifyPhoneCode } from "@/lib/firebase/auth"

export function SignUpForm() {
  const router = useRouter()
  const { signUp, signInWithGoogleProvider } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const recaptchaVerifierRef = useRef<any>(null)

  useEffect(() => {
    // Initialize reCAPTCHA verifier
    if (typeof window !== "undefined") {
      recaptchaVerifierRef.current = createRecaptchaVerifier("recaptcha-container-signup")
    }
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear()
      }
    }
  }, [])

  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const result = await signUp(email, password, name)

    setIsLoading(false)

    if (result.success) {
      toastSuccess("Welcome to FinMaester! Please verify your email.")
      router.push("/dashboard")
    } else {
      toastError(result.error || "Failed to create account")
    }
  }

  const handlePhoneSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    if (!confirmationResult) {
      // Send verification code
      const formData = new FormData(e.currentTarget)
      const phone = formData.get("phone") as string
      if (!recaptchaVerifierRef.current) {
        toastError("reCAPTCHA not initialized")
        setIsLoading(false)
        return
      }

      const { confirmationResult: result, error } = await sendPhoneVerificationCode(
        phone,
        recaptchaVerifierRef.current
      )

      if (error) {
        toastError(error)
        setIsLoading(false)
        return
      }

      setConfirmationResult(result)
      setPhoneNumber(phone)
      toastSuccess("Verification code sent! Please check your phone.")
      setIsLoading(false)
    } else {
      // Verify code
      const { user, error } = await verifyPhoneCode(confirmationResult, verificationCode)

      if (error) {
        toastError(error)
        setIsLoading(false)
        return
      }

      toastSuccess("Welcome to FinMaester!")
      router.push("/dashboard")
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)

    const result = await signInWithGoogleProvider()

    setIsLoading(false)

    if (result.success) {
      toastSuccess("Welcome to FinMaester!")
      router.push("/dashboard")
    } else {
      toastError(result.error || "Failed to sign in with Google")
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="phone">Phone</TabsTrigger>
        </TabsList>
        <TabsContent value="email" className="space-y-4">
          <form onSubmit={handleEmailSignUp}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={isLoading}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="password" name="password" type="password" disabled={isLoading} className="pl-10" required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </div>
          </form>
        </TabsContent>
        <TabsContent value="phone" className="space-y-4">
          <form onSubmit={handlePhoneSignUp}>
            <div className="space-y-4">
              {!confirmationResult ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name-phone">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name-phone"
                        name="name"
                        placeholder="John Doe"
                        type="text"
                        autoCapitalize="none"
                        autoCorrect="off"
                        disabled={isLoading}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
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
                  <div id="recaptcha-container-signup"></div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending code..." : "Send Verification Code"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input
                      id="code"
                      placeholder="Enter 6-digit code"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      disabled={isLoading}
                      maxLength={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || !verificationCode}>
                    {isLoading ? "Verifying..." : "Verify Code"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setConfirmationResult(null)
                      setVerificationCode("")
                    }}
                    disabled={isLoading}
                  >
                    Change Phone Number
                  </Button>
                </>
              )}
            </div>
          </form>
        </TabsContent>
      </Tabs>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignUp} disabled={isLoading}>
        <svg
          className="mr-2 h-4 w-4"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="google"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 488 512"
        >
          <path
            fill="currentColor"
            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
          ></path>
        </svg>
        Google
      </Button>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
