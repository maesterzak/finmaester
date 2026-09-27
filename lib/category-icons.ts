import {
  BookOpen,
  Briefcase,
  Car,
  Coffee,
  Coins,
  Gift,
  Heart,
  Home,
  Landmark,
  ShoppingBag,
  Wallet,
  type LucideIcon,
} from "lucide-react"

// Categories store their icon as a lucide component name (e.g. "Briefcase")
export const categoryIconMap: Record<string, LucideIcon> = {
  BookOpen,
  Briefcase,
  Car,
  Coffee,
  Coins,
  Gift,
  Heart,
  Home,
  Landmark,
  ShoppingBag,
  Wallet,
}

export function getCategoryIcon(icon: unknown): LucideIcon {
  if (typeof icon === "string") return categoryIconMap[icon] ?? ShoppingBag
  // Older in-memory data may already hold a component
  if (icon && (typeof icon === "function" || typeof icon === "object")) return icon as LucideIcon
  return ShoppingBag
}

export const DEFAULT_CATEGORY_COLOR = "hsl(156, 100%, 40%)"
