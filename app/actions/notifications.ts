"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/notifications/identity"
import { getInbox, getUnreadCount, markAllRead, markDeliveriesRead } from "@/lib/notifications/inbox"
import {
  getSubscriptionsForUser,
  upsertKpiSubscription,
  upsertPortfolioSubscription,
} from "@/lib/notifications/subscriptions"
import { evaluateAndDispatch } from "@/lib/notifications/evaluate"
import { writeAudit } from "@/lib/notifications/audit"
import { AuthorizationError, requireRole } from "@/lib/notifications/rbac"
import type { InboxItem, Severity } from "@/lib/notifications/types"

export async function fetchInbox(): Promise<{ items: InboxItem[]; unread: number }> {
  const user = await getCurrentUser()
  const [items, unread] = await Promise.all([getInbox(user.id), getUnreadCount(user.id)])
  return { items, unread }
}

export async function markRead(deliveryIds: string[]): Promise<number> {
  const user = await getCurrentUser()
  const n = await markDeliveriesRead(user.id, deliveryIds)
  revalidatePath("/notifications")
  return n
}

export async function markAllNotificationsRead(): Promise<number> {
  const user = await getCurrentUser()
  const n = await markAllRead(user.id)
  revalidatePath("/notifications")
  return n
}

export async function fetchSubscriptions() {
  const user = await getCurrentUser()
  return getSubscriptionsForUser(user.id)
}

export async function saveKpiSubscription(
  kpiId: string,
  prefs: { dashboard: boolean; email: boolean; teams: boolean; minSeverity: Severity },
) {
  const user = await getCurrentUser()
  await upsertKpiSubscription(user.id, kpiId, prefs)
  await writeAudit({
    actorUserId: user.id,
    action: "subscription.update",
    entityType: "subscription",
    entityId: `kpi:${kpiId}`,
    metadata: prefs,
  })
  revalidatePath("/notifications")
}

export async function savePortfolioSubscription(prefs: {
  dashboard: boolean
  email: boolean
  teams: boolean
  minSeverity: Severity
}) {
  const user = await getCurrentUser()
  await upsertPortfolioSubscription(user.id, prefs)
  await writeAudit({
    actorUserId: user.id,
    action: "subscription.update",
    entityType: "subscription",
    entityId: "portfolio",
    metadata: prefs,
  })
  revalidatePath("/notifications")
}

/** Manual "Check now" trigger from the UI. */
export async function runEvaluationNow(): Promise<{
  skipped: boolean
  eventsCreated: number
  error?: string
}> {
  try {
    // Running a portfolio-wide evaluation is a privileged action (manager+).
    const user = await requireRole("manager")
    const result = await evaluateAndDispatch(user.id)
    revalidatePath("/notifications")
    return result
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { skipped: true, eventsCreated: 0, error: "You need a Manager or Administrator role to run an evaluation." }
    }
    const cause = err instanceof Error && "cause" in err ? (err as { cause?: unknown }).cause : undefined
    const message = `${err instanceof Error ? err.message : String(err)}${
      cause ? ` | cause: ${cause instanceof Error ? cause.message : String(cause)}` : ""
    }`
    console.log("[kpi] runEvaluationNow failed:", message)
    return { skipped: true, eventsCreated: 0, error: message }
  }
}
