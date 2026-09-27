import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Settings" }

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
