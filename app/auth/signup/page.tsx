import { AuthLayout } from "@/components/auth/auth-layout"
import { SignUpForm } from "@/components/auth/signup-form"

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create an Account"
      description="Sign up for FinMaester to start tracking your finances"
      backLink="/"
      backLinkText="Already have an account? Sign in"
    >
      <SignUpForm />
    </AuthLayout>
  )
}
