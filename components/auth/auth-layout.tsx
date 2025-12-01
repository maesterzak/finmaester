import type React from "react"
import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Logo } from "../logo"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  backLink?: string
  backLinkText?: string
}

export function AuthLayout({ children, title, description, backLink, backLinkText }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Logo variant="full" size="md" />
        </Link>
        <ModeToggle />
      </header>
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
          <div className="border rounded-lg p-6 space-y-6 bg-card">{children}</div>
          {backLink && (
            <div className="text-center">
              <Button variant="link" asChild>
                <Link href={backLink}>{backLinkText || "Back"}</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
