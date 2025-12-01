"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface ShareDashboardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onShare: (user: any) => void
}

export function ShareDashboardDialog({ open, onOpenChange, onShare }: ShareDashboardDialogProps) {
  const [email, setEmail] = useState("")
  const [accessLevel, setAccessLevel] = useState("read-only")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, you would validate the email and check if the user exists
    const newSharedUser = {
      name: email.split("@")[0], // Just for demo purposes
      email,
      avatar: "/placeholder.svg?height=40&width=40",
      accessLevel,
    }

    onShare(newSharedUser)
    setEmail("")
    setAccessLevel("read-only")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Share Dashboard</DialogTitle>
            <DialogDescription>Share your financial dashboard with others.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Access Level</Label>
              <RadioGroup value={accessLevel} onValueChange={setAccessLevel} className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="read-only" id="access-read-only" />
                  <Label htmlFor="access-read-only">Read-only (Can view your dashboard but not make changes)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Share</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
