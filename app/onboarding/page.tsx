import { redirect } from "next/navigation"

// The old onboarding wizard never saved anything; new users go straight to the dashboard
export default function OnboardingPage() {
  redirect("/dashboard")
}
