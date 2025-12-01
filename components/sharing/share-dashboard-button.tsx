"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { ShareDashboardDialog } from "@/components/sharing/share-dashboard-dialog"

export function ShareDashboardButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="mr-2 h-4 w-4" />
        Share Dashboard
      </Button>
      <ShareDashboardDialog
        open={open}
        onOpenChange={setOpen}
        onShare={() => {
          // This will be handled by the parent component
          setOpen(false)
        }}
      />
    </>
  )
}
