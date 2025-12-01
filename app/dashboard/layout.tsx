import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <DashboardSidebar />
          <main className="flex-1 p-4 md:p-8 overflow-auto">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
