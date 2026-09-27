import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SettingsForm } from "@/components/settings/settings-form"

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <DashboardHeader title="Settings" description="Your profile, appearance and sign-in" />
      <SettingsForm />
    </div>
  )
}
