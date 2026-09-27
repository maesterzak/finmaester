import type { Metadata } from "next"
import { AuthLayout } from "@/components/auth/auth-layout"
import { SignUpForm } from "@/components/auth/signup-form"

export const metadata: Metadata = { title: "Create account" }

export default function SignUpPage() {
  return (
    <AuthLayout title="Create your account" description="Free forever. Start tracking your money in a minute.">
      <SignUpForm />
    </AuthLayout>
  )
}
