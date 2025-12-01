"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ShareDashboardDialog } from "@/components/sharing/share-dashboard-dialog"
import { MonthlyReportDialog } from "@/components/sharing/monthly-report-dialog"

// Mock data - in a real app, this would come from your API
const initialSharedUsers = [
  {
    id: "u1",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    dateShared: "2025-04-15",
  },
  {
    id: "u2",
    name: "Michael Johnson",
    email: "michael@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    dateShared: "2025-04-28",
  },
]

export function SharingList() {
  const [sharedUsers, setSharedUsers] = useState(initialSharedUsers)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false)
  const [monthlyReportEnabled, setMonthlyReportEnabled] = useState(true)

  const handleAddSharedUser = (newUser: any) => {
    setSharedUsers([
      ...sharedUsers,
      {
        ...newUser,
        id: `u${sharedUsers.length + 1}`,
        dateShared: new Date().toISOString().split("T")[0],
      },
    ])
    setIsShareDialogOpen(false)
  }

  const handleRevokeAccess = (id: string) => {
    setSharedUsers(sharedUsers.filter((user) => user.id !== id))
  }

  // Check if it's the last day of the month
  const today = new Date()
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const isLastDayOfMonth = today.getDate() === lastDayOfMonth

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Shared With</CardTitle>
              <CardDescription>Manage who has access to your financial dashboard</CardDescription>
            </div>
            <Button onClick={() => setIsShareDialogOpen(true)} className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Share Dashboard
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sharedUsers.length > 0 ? (
            <div className="space-y-4">
              {sharedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Read-only</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleRevokeAccess(user.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Revoke Access
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              You haven&apos;t shared your dashboard with anyone yet.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Report Sharing</CardTitle>
          <CardDescription>Configure automatic monthly report generation and sharing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="monthly-report">Enable Monthly Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically generate and share monthly expense reports
                </p>
              </div>
              <Switch id="monthly-report" checked={monthlyReportEnabled} onCheckedChange={setMonthlyReportEnabled} />
            </div>

            {isLastDayOfMonth && monthlyReportEnabled && (
              <Button className="w-full" onClick={() => setIsMonthlyReportOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Share My Monthly Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ShareDashboardDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        onShare={handleAddSharedUser}
      />

      <MonthlyReportDialog open={isMonthlyReportOpen} onOpenChange={setIsMonthlyReportOpen} />
    </div>
  )
}
