"use client"

import { useState, useTransition } from "react"
import { RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { runEvaluationNow } from "@/app/actions/notifications"
import { hasRole, type CurrentUser, type InboxItem, type Severity } from "@/lib/notifications/types"
import { InboxPanel } from "./inbox-panel"
import { SubscriptionsPanel, type KpiPref, type ChannelPref } from "./subscriptions-panel"
import { ProfilePanel } from "./profile-panel"

export function NotificationsView({
  user,
  initialInbox,
  portfolioSubscription,
  kpiSubscriptions,
}: {
  user: CurrentUser
  initialInbox: InboxItem[]
  portfolioSubscription: ChannelPref | null
  kpiSubscriptions: KpiPref[]
}) {
  const [checkResult, setCheckResult] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const canRunEvaluation = hasRole(user.role, "manager")

  function handleCheckNow() {
    setCheckResult(null)
    startTransition(async () => {
      const result = await runEvaluationNow()
      if (result.error) {
        setCheckResult(`Error: ${result.error}`)
      } else if (result.skipped) {
        setCheckResult("Evaluation skipped — KPI data was unavailable.")
      } else if (result.eventsCreated === 0) {
        setCheckResult("Check complete. No new alerts — everything is up to date.")
      } else {
        setCheckResult(
          `Check complete. ${result.eventsCreated} new alert${result.eventsCreated === 1 ? "" : "s"} generated.`,
        )
      }
    })
  }

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy text-balance">Notifications</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty">
            Review KPI alerts, choose which KPIs you follow, and set how you want to be notified when a status changes.
          </p>
        </div>
        {canRunEvaluation ? (
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Button onClick={handleCheckNow} disabled={pending} className="gap-2">
              <RefreshCw className={pending ? "size-4 animate-spin" : "size-4"} />
              {pending ? "Checking…" : "Check now"}
            </Button>
            {checkResult ? <p className="text-xs text-muted-foreground">{checkResult}</p> : null}
          </div>
        ) : null}
      </div>

      <Tabs defaultValue="inbox" className="mt-6">
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-6">
          <InboxPanel initialItems={initialInbox} />
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-6">
          <SubscriptionsPanel portfolio={portfolioSubscription} kpiPrefs={kpiSubscriptions} />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <ProfilePanel user={user} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
