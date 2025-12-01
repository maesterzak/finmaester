"use client"

import type React from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"

interface DashboardHeaderProps {
  title?: string
  description?: string
  action?: React.ReactNode
}

export function DashboardHeader({
  title = "Dashboard",
  description = "Overview of your finances",
  action,
}: DashboardHeaderProps) {
  const { setMobileOpen } = useSidebar()
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div className="flex items-center gap-3 w-full">
        {isMobile && (
          <Button variant="outline" size="icon" onClick={() => setMobileOpen(true)} className="flex sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  )
}
