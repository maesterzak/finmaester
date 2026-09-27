"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { updateProfile } from "firebase/auth"
import { KeyRound, LogOut, Monitor, Moon, Sun, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { useCurrency } from "@/contexts/FinanceDataContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CURRENCIES, currencyName } from "@/lib/currency"
import { currencySymbol, formatCurrency } from "@/lib/formatCurrency"
import { toastError, toastSuccess } from "@/lib/toast"
import { cn } from "@/lib/utils"

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

export function SettingsForm() {
  const { user, resetPasswordEmail, signOut } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [name, setName] = useState("")
  const [savedName, setSavedName] = useState("")
  const [savingName, setSavingName] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)
  const { currency, setCurrency } = useCurrency()
  const [pendingCurrency, setPendingCurrency] = useState<string | null>(null)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    setName(user?.displayName ?? "")
    setSavedName(user?.displayName ?? "")
  }, [user])

  const usesPassword = !!user?.providerData.some((p) => p.providerId === "password")
  const usesGoogle = !!user?.providerData.some((p) => p.providerId === "google.com")
  const initials = (savedName || user?.email || "?")
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    const clean = name.trim()
    if (!user || !clean || clean === savedName) return
    setSavingName(true)
    try {
      await updateProfile(user, { displayName: clean })
      setSavedName(clean)
      toastSuccess("Name updated")
    } catch {
      toastError("Couldn't update your name. Please try again.")
    }
    setSavingName(false)
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return
    setSendingReset(true)
    const { success, error } = await resetPasswordEmail(user.email)
    setSendingReset(false)
    if (success) toastSuccess(`Password reset link sent to ${user.email}`)
    else toastError(error || "Couldn't send the reset email")
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 items-start">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How you appear in FinMaester</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveName} className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xl font-semibold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{savedName || "No name set"}</p>
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="display-name">Name</Label>
              <Input
                id="display-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                maxLength={60}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={savingName || !name.trim() || name.trim() === savedName}>
                {savingName ? "Saving…" : "Save name"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose how FinMaester looks on this device</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map(({ value, label, icon: Icon }) => {
                const active = mounted && theme === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTheme(value)}
                    aria-pressed={active}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border p-3 text-sm transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              {usesGoogle && !usesPassword ? "You sign in with Google" : "Manage how you sign in"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {usesPassword ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">We&apos;ll email you a secure link to set a new password.</p>
                <Button
                  variant="outline"
                  onClick={handlePasswordReset}
                  disabled={sendingReset}
                  className="gap-2 shrink-0"
                >
                  <KeyRound className="h-4 w-4" />
                  {sendingReset ? "Sending…" : "Change password"}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {usesGoogle
                  ? "Your password and 2-step verification are managed in your Google account."
                  : "Your sign-in is managed by your sign-in provider."}
              </p>
            )}
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="gap-2 text-destructive hover:text-destructive -ml-2"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Money</CardTitle>
            <CardDescription>Currency, budgets and goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={(code) => code !== currency && setPendingCurrency(code)}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="inline-block w-10 text-muted-foreground">{currencySymbol(c.code)}</span>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                The currency you record and view your money in, e.g. {formatCurrency(1234.5)}.
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Monthly investment target</span>
              <Button asChild variant="ghost" size="sm" className="gap-1.5 -mr-2">
                <Link href="/dashboard/investments">
                  <Target className="h-3.5 w-3.5" /> Manage
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Category budgets</span>
              <Button asChild variant="ghost" size="sm" className="-mr-2">
                <Link href="/dashboard/categories">Manage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!pendingCurrency} onOpenChange={(open) => !open && setPendingCurrency(null)}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to {pendingCurrency && currencyName(pendingCurrency)}?</AlertDialogTitle>
            <AlertDialogDescription>
              Amounts you&apos;ve already recorded keep their numbers and will be shown in{" "}
              {pendingCurrency} instead of {currency}. They aren&apos;t converted, so{" "}
              {formatCurrency(5000, currency)} will show as {pendingCurrency && formatCurrency(5000, pendingCurrency)}.
              Switch only if you&apos;re starting fresh or your records are already in {pendingCurrency}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep {currency}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const code = pendingCurrency
                setPendingCurrency(null)
                if (code && (await setCurrency(code))) toastSuccess(`Currency changed to ${currencyName(code)}`)
              }}
            >
              Switch currency
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
