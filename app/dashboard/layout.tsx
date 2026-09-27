import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { FinanceDataProvider } from "@/contexts/FinanceDataContext"
import type { Metadata } from "next"

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s · FinMaester" } }

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      {/* One shared copy of the user's data for every dashboard page */}
      <FinanceDataProvider>
        <SidebarProvider>
          <div className="flex min-h-screen">
            <div className="print:hidden">
              <DashboardSidebar />
            </div>
            <main className="flex-1 min-w-0 p-2 sm:p-4 md:p-8 overflow-auto">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>
          </div>
        </SidebarProvider>
      </FinanceDataProvider>
    </ProtectedRoute>
  )
}
