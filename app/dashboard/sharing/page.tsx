import { redirect } from "next/navigation"

// Sharing was replaced by Reports; keep old links working
export default function SharingPage() {
  redirect("/dashboard/reports")
}
