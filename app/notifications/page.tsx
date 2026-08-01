import type { Metadata } from "next"
import { getCurrentUser } from "@/lib/notifications/identity"
import { getInbox } from "@/lib/notifications/inbox"
import { getSubscriptionsForUser } from "@/lib/notifications/subscriptions"
import { isDatabaseConfigured } from "@/lib/db"
import { NotificationsView } from "@/components/notifications/notifications-view"
import { DbUnavailable } from "@/components/notifications/db-unavailable"

export const metadata: Metadata = {
  title: "Notifications | CNS HIAA",
  description: "Manage KPI alert subscriptions, review your notification inbox, and configure delivery channels.",
}

// The inbox reflects live delivery state, so render on demand.
export const dynamic = "force-dynamic"

export default async function NotificationsPage() {
  if (!isDatabaseConfigured()) {
    return (
      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <DbUnavailable />
      </main>
    )
  }

  const user = await getCurrentUser()

  // Fail soft: a database hiccup should show an empty state, not a crash.
  let inbox = []
  let subscriptions = []
  try {
    ;[inbox, subscriptions] = await Promise.all([getInbox(user.id), getSubscriptionsForUser(user.id)])
  } catch (err) {
    console.log("[v0] notifications page load failed:", err instanceof Error ? err.message : err)
    return (
      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <DbUnavailable />
      </main>
    )
  }

  const portfolioSub = subscriptions.find((s) => s.scope === "portfolio") ?? null
  const kpiSubs = subscriptions.filter((s) => s.scope === "kpi")

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <NotificationsView
        user={user}
        initialInbox={inbox}
        portfolioSubscription={
          portfolioSub
            ? {
                dashboard: portfolioSub.channelDashboard,
                email: portfolioSub.channelEmail,
                teams: portfolioSub.channelTeams,
                minSeverity: portfolioSub.minSeverity as never,
              }
            : null
        }
        kpiSubscriptions={kpiSubs.map((s) => ({
          kpiId: s.kpiId as string,
          dashboard: s.channelDashboard,
          email: s.channelEmail,
          teams: s.channelTeams,
          minSeverity: s.minSeverity as never,
        }))}
      />
    </main>
  )
}
