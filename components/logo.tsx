"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  variant?: "icon" | "full" | "text"
  size?: "sm" | "md" | "lg" | "xl"
  theme?: "light" | "dark" | "auto"
  gradient?: boolean
  className?: string
}

export function Logo({ variant = "full", size = "md", theme = "auto", gradient = false, className }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-lg", gap: "gap-1.5" },
    md: { icon: 32, text: "text-xl", gap: "gap-2" },
    lg: { icon: 40, text: "text-2xl", gap: "gap-2.5" },
    xl: { icon: 56, text: "text-4xl", gap: "gap-3" },
  }

  const { icon: iconSize, text: textSize, gap } = sizes[size]

  const getColors = () => {
    if (theme === "light") return { primary: "#10B981", secondary: "#059669", text: "#111827" }
    if (theme === "dark") return { primary: "#10B981", secondary: "#34D399", text: "#F9FAFB" }
    return { primary: "#10B981", secondary: "#059669", text: "currentColor" }
  }

  const colors = getColors()

  const IconSVG = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {gradient ? (
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
        </defs>
      ) : null}

      {/* Outer hexagon frame */}
      <path
        d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
        fill={gradient ? "url(#logoGradient)" : colors.primary}
        fillOpacity="0.15"
        stroke={gradient ? "url(#logoGradient)" : colors.primary}
        strokeWidth="2"
      />

      {/* Inner chart bars representing growth */}
      <rect x="14" y="28" width="4" height="8" rx="1" fill={colors.primary} />
      <rect x="22" y="22" width="4" height="14" rx="1" fill={gradient ? colors.secondary : colors.primary} />
      <rect x="30" y="16" width="4" height="20" rx="1" fill={colors.primary} />

      {/* Upward trend line */}
      <path
        d="M14 26L22 20L30 14"
        stroke={colors.secondary}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dot at peak */}
      <circle cx="30" cy="14" r="2.5" fill={colors.secondary} />
    </svg>
  )

  if (variant === "icon") {
    return <IconSVG />
  }

  if (variant === "text") {
    return (
      <span className={cn("font-bold tracking-tight", textSize, className)} style={{ color: colors.text }}>
        fin<span style={{ color: colors.primary }}>maester</span>
      </span>
    )
  }

  return (
    <div className={cn("flex items-center", gap, className)}>
      <IconSVG />
      <span className={cn("font-bold tracking-tight", textSize)} style={{ color: colors.text }}>
        fin<span style={{ color: colors.primary }}>maester</span>
      </span>
    </div>
  )
}

// Favicon/App Icon exports
export function LogoFavicon() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="2" />
      <rect x="14" y="28" width="4" height="8" rx="1" fill="#10B981" />
      <rect x="22" y="22" width="4" height="14" rx="1" fill="#059669" />
      <rect x="30" y="16" width="4" height="20" rx="1" fill="#10B981" />
      <path d="M14 26L22 20L30 14" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="30" cy="14" r="2.5" fill="#059669" />
    </svg>
  )
}
