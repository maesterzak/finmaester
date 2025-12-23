"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { BarChart3, Home, PlusCircle, Settings, Share2, LogOut, User, Layers } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Logo } from "../logo"

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { expanded, isMobile } = useSidebar()
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  // Helper function to create menu items
  const MenuItem = ({
    href,
    icon: Icon,
    label,
    isActive,
  }: { href: string; icon: any; label: string; isActive: boolean }) => {
    const { setMobileOpen } = useSidebar()

    const handleClick = () => {
      if (isMobile) {
        setMobileOpen(false)
      }
    }

    const linkContent = (
      <div className="flex items-center gap-3 w-full">
        <Icon className="h-5 w-5" />
        {(expanded || isMobile) && <span>{label}</span>}
      </div>
    )

    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive} tooltip={label} onClick={handleClick}>
          <Link href={href}>{linkContent}</Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Sidebar >
      <SidebarHeader className="flex items-center justify-between p-4 ">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo variant="full" size="md" />
        </Link>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <MenuItem href="/dashboard" icon={Home} label="Dashboard" isActive={pathname === "/dashboard"} />
          <MenuItem
            href="/dashboard/transactions"
            icon={PlusCircle}
            label="Transactions"
            isActive={pathname === "/dashboard/transactions"}
          />
          <MenuItem
            href="/dashboard/categories"
            icon={Layers}
            label="Categories"
            isActive={pathname === "/dashboard/categories"}
          />
          <MenuItem
            href="/dashboard/sharing"
            icon={Share2}
            label="Sharing"
            isActive={pathname === "/dashboard/sharing"}
          />
          <MenuItem
            href="/dashboard/settings"
            icon={Settings}
            label="Settings"
            isActive={pathname === "/dashboard/settings"}
          />
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className={cn("flex items-center", expanded || isMobile ? "justify-between" : "justify-center")}>
          {expanded || isMobile ? (
            <>
              <div className="flex items-center gap-2">
                <User className="h-8 w-8 rounded-full bg-muted p-1" />
                <div>
                  <p className="text-sm font-medium">{user?.displayName || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ModeToggle />
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Log out</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <User className="h-8 w-8 rounded-full bg-muted p-1" />
              <ModeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          )}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function cn(...inputs: (string | undefined | boolean)[]) {
  return inputs.filter(Boolean).join(" ")
}
