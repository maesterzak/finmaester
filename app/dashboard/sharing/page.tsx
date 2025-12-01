import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SharingList } from "@/components/sharing/sharing-list"
import { ShareDashboardButton } from "@/components/sharing/share-dashboard-button"

export default function SharingPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <DashboardHeader
        title="Sharing"
        description="Manage dashboard sharing permissions"
        action={<ShareDashboardButton />}
      />
      <SharingList />
    </div>
  )
}
