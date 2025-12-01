"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Check } from 'lucide-react'
import { CURRENCIES, Currency } from "@/lib/currency"

export function CurrencySettings() {
  const [baseCurrency, setBaseCurrency] = useState<Currency>("USD")
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    // Save to localStorage or API
    localStorage.setItem("baseCurrency", baseCurrency)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const currencyOptions = Object.entries(CURRENCIES).map(([code, { name }]) => ({
    code: code as Currency,
    name,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency Settings</CardTitle>
        <CardDescription>Set your default currency for all financial calculations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="base-currency">Base Currency</Label>
          <Select value={baseCurrency} onValueChange={(value) => setBaseCurrency(value as Currency)}>
            <SelectTrigger id="base-currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((option) => (
                <SelectItem key={option.code} value={option.code}>
                  {option.code} - {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          All amounts in your dashboard will be displayed in {CURRENCIES[baseCurrency].name}
        </p>
        <Button onClick={handleSave} className="w-full">
          {isSaved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved
            </>
          ) : (
            "Save Currency"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
