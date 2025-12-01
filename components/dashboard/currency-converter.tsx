"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft } from 'lucide-react'
import { CURRENCIES, Currency, convertCurrency, formatCurrency } from "@/lib/currency"

export function CurrencyConverter() {
  const [fromCurrency, setFromCurrency] = useState<Currency>("USD")
  const [toCurrency, setToCurrency] = useState<Currency>("EUR")
  const [amount, setAmount] = useState("100")

  const convertedAmount = convertCurrency(parseFloat(amount) || 0, fromCurrency, toCurrency)

  const handleSwap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const currencyOptions = Object.entries(CURRENCIES).map(([code, { name }]) => ({
    code: code as Currency,
    name,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency Converter</CardTitle>
        <CardDescription>Real-time currency conversion for your finances</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* From currency */}
          <div className="space-y-2">
            <Label htmlFor="from-currency">From</Label>
            <div className="space-y-2">
              <Select value={fromCurrency} onValueChange={(value) => setFromCurrency(value as Currency)}>
                <SelectTrigger id="from-currency">
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
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Swap button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwap}
              className="h-10 w-10"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* To currency */}
          <div className="space-y-2">
            <Label htmlFor="to-currency">To</Label>
            <div className="space-y-2">
              <Select value={toCurrency} onValueChange={(value) => setToCurrency(value as Currency)}>
                <SelectTrigger id="to-currency">
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
              <div className="px-3 py-2 border rounded-md bg-muted">
                <p className="text-sm font-semibold">{formatCurrency(convertedAmount, toCurrency)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Exchange rate */}
        <div className="p-3 rounded-lg bg-muted/50 border">
          <p className="text-sm text-muted-foreground">
            1 {fromCurrency} = {formatCurrency(convertCurrency(1, fromCurrency, toCurrency), toCurrency)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
