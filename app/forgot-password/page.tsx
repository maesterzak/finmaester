import type { Metadata } from "next"
import { AuthLayout } from "@/components/auth/auth-layout"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = { title: "Reset password" }

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      description="Enter the email you signed up with and we'll send you a reset link"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
