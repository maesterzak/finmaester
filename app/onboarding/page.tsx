"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ArrowRight, DollarSign, Zap, TrendingUp } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [userData, setUserData] = useState({
    name: "",
    currency: "USD",
    monthlyIncome: "",
    monthlyBudget: "",
  })

  const steps = [
    {
      title: "Welcome to FinMaester",
      description: "Let's set up your personal finance dashboard",
      icon: DollarSign,
    },
    {
      title: "Basic Information",
      description: "Tell us about yourself",
      icon: Zap,
    },
    {
      title: "Financial Goals",
      description: "Set your financial targets",
      icon: TrendingUp,
    },
  ]

  const handleNextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      // Save user data and redirect to dashboard
      localStorage.setItem("onboardingComplete", "true")
      localStorage.setItem("userData", JSON.stringify(userData))
      router.push("/dashboard")
    }
  }

  const CurrentIcon = steps[step].icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    index <= step
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index < step ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-all ${
                      index < step ? "bg-emerald-500" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Step {step + 1} of {steps.length}
          </p>
        </div>

        {/* Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-emerald-500/10">
                <CurrentIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <CardTitle className="text-3xl">{steps[step].title}</CardTitle>
            <CardDescription className="text-base mt-2">
              {steps[step].description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 0 && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    Features You'll Get:
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Budget tracking with smart alerts
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Recurring expense reminders
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Income & expense analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Subscription tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Multi-currency support
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Preferred Currency</Label>
                  <Select value={userData.currency} onValueChange={(value) => setUserData({ ...userData, currency: value })}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="income">Monthly Income</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">$</span>
                    <Input
                      id="income"
                      type="number"
                      placeholder="0.00"
                      value={userData.monthlyIncome}
                      onChange={(e) => setUserData({ ...userData, monthlyIncome: e.target.value })}
                      className="pl-7"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Monthly Budget</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">$</span>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="0.00"
                      value={userData.monthlyBudget}
                      onChange={(e) => setUserData({ ...userData, monthlyBudget: e.target.value })}
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-4">
              {step > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNextStep}
                className="flex-1"
              >
                {step === steps.length - 1 ? (
                  <>
                    Get Started
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
