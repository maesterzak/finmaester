"use client"

import * as React from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

// Create context for sidebar state
type SidebarContextType = {
  expanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
  mobileOpen: boolean
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = React.useState(true)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const isMobile = useIsMobile()

  // Reset expanded state based on screen size
  React.useEffect(() => {
    setExpanded(!isMobile)
  }, [isMobile])

  const value = React.useMemo(
    () => ({ expanded, setExpanded, mobileOpen, setMobileOpen, isMobile }),
    [expanded, mobileOpen, isMobile],
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export function Sidebar({ children, className }: { children: React.ReactNode; className?: string }) {
  const { expanded, mobileOpen, isMobile, setMobileOpen } = useSidebar()

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm w-screen overflow-hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r bg-card text-card-foreground",
          isMobile ? "w-[280px] transition-transform duration-300 ease-in-out" : expanded ? "w-64" : "w-[70px]",
          isMobile && !mobileOpen && "-translate-x-full",
          className,
        )}
      >
        {children}
      </aside>

      {/* Content margin for desktop */}
      {!isMobile && <div className={expanded ? "w-64" : "w-[70px]"} />}
    </>
  )
}

export function SidebarHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex h-14 items-center border-b px-4", className)}>{children}</div>
}

export function SidebarContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex-1 overflow-auto py-2", className)}>{children}</div>
}

export function SidebarFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("border-t p-4", className)}>{children}</div>
}

export function SidebarTrigger() {
  const { expanded, setExpanded, mobileOpen, setMobileOpen, isMobile } = useSidebar()

  const handleClick = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen)
    } else {
      setExpanded(!expanded)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <line x1="3" x2="21" y1="6" y2="6" />
        <line x1="3" x2="21" y1="12" y2="12" />
        <line x1="3" x2="21" y1="18" y2="18" />
      </svg>
      <span className="sr-only">Toggle sidebar</span>
    </button>
  )
}

export function SidebarMenu({ className, children }: { className?: string; children: React.ReactNode }) {
  return <nav className={cn("flex flex-col gap-1 px-2", className)}>{children}</nav>
}

export function SidebarMenuItem({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("", className)}>{children}</div>
}

export function SidebarMenuButton({
  className,
  children,
  isActive,
  tooltip,
  asChild,
  onClick,
}: {
  className?: string
  children: React.ReactNode
  isActive?: boolean
  tooltip?: string
  asChild?: boolean
  onClick?: () => void
}) {
  const { expanded, isMobile } = useSidebar()
  const showFullSidebar = expanded || isMobile

  // If asChild is true, we need to clone the child element with our props
  if (asChild) {
    // Get the first child element
    const child = React.Children.only(children) as React.ReactElement

    // Clone the child with our props
    return React.cloneElement(child, {
      className: cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50 hover:text-accent-foreground",
        !showFullSidebar && "justify-center px-0",
        className,
        child.props.className,
      ),
      title: !showFullSidebar ? tooltip : undefined,
      onClick: (e: React.MouseEvent) => {
        // Call the original onClick if it exists
        if (child.props.onClick) {
          child.props.onClick(e)
        }
        // Call our onClick if it exists
        if (onClick) {
          onClick()
        }
      },
    })
  }

  // If not using asChild, render a regular button
  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50 hover:text-accent-foreground",
        !showFullSidebar && "justify-center px-0",
        className,
      )}
      title={!showFullSidebar ? tooltip : undefined}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function SidebarRail() {
  const { expanded, setExpanded, isMobile } = useSidebar()

  if (isMobile) return null

  return (
    <div
      className="absolute top-1/2 -right-3 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border bg-background shadow-sm"
      onClick={() => setExpanded(!expanded)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("h-4 w-4 transition-transform", expanded ? "rotate-180" : "rotate-0")}
      >
        <path d="m15 6-6 6 6 6" />
      </svg>
    </div>
  )
}
