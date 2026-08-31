import "server-only"

import { randomUUID } from "crypto"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { subscription } from "@/lib/db/schema"
import type { Severity } from "./types"

export type SubscriptionRow = typeof subscription.$inferSelect

/**
 * Return every subscription for a user. If the user has none yet, seed a
 * sensible default (portfolio-level, dashboard channel, warning threshold) so
 * they receive portfolio alerts out of the box.
 */
export async function getSubscriptionsForUser(userId: string): Promise<SubscriptionRow[]> {
  const rows = await db.select().from(subscription).where(eq(subscription.userId, userId))
  if (rows.length > 0) return rows

  const seed: typeof subscription.$inferInsert = {
    id: randomUUID(),
    userId,
    scope: "portfolio",
    kpiId: null,
    channelDashboard: true,
    channelEmail: false,
    channelTeams: false,
    minSeverity: "warning",
  }
  await db.insert(subscription).values(seed)
  return db.select().from(subscription).where(eq(subscription.userId, userId))
}

/** Upsert a KPI-scoped subscription's channel + severity preferences. */
export async function upsertKpiSubscription(
  userId: string,
  kpiId: string,
  prefs: { dashboard: boolean; email: boolean; teams: boolean; minSeverity: Severity },
): Promise<void> {
  const existing = await db
    .select()
    .from(subscription)
    .where(and(eq(subscription.userId, userId), eq(subscription.scope, "kpi"), eq(subscription.kpiId, kpiId)))
    .limit(1)

  const enabled = prefs.dashboard || prefs.email || prefs.teams

  if (existing.length === 0) {
    if (!enabled) return // nothing to store for a fully-disabled new subscription
    await db.insert(subscription).values({
      id: randomUUID(),
      userId,
      scope: "kpi",
      kpiId,
      channelDashboard: prefs.dashboard,
      channelEmail: prefs.email,
      channelTeams: prefs.teams,
      minSeverity: prefs.minSeverity,
    })
    return
  }

  await db
    .update(subscription)
    .set({
      channelDashboard: prefs.dashboard,
      channelEmail: prefs.email,
      channelTeams: prefs.teams,
      minSeverity: prefs.minSeverity,
      updatedAt: new Date(),
    })
    .where(eq(subscription.id, existing[0].id))
}

/** Upsert the single portfolio-scoped subscription for a user. */
export async function upsertPortfolioSubscription(
  userId: string,
  prefs: { dashboard: boolean; email: boolean; teams: boolean; minSeverity: Severity },
): Promise<void> {
  const existing = await db
    .select()
    .from(subscription)
    .where(and(eq(subscription.userId, userId), eq(subscription.scope, "portfolio")))
    .limit(1)

  if (existing.length === 0) {
    await db.insert(subscription).values({
      id: randomUUID(),
      userId,
      scope: "portfolio",
      kpiId: null,
      channelDashboard: prefs.dashboard,
      channelEmail: prefs.email,
      channelTeams: prefs.teams,
      minSeverity: prefs.minSeverity,
    })
    return
  }

  await db
    .update(subscription)
    .set({
      channelDashboard: prefs.dashboard,
      channelEmail: prefs.email,
      channelTeams: prefs.teams,
      minSeverity: prefs.minSeverity,
      updatedAt: new Date(),
    })
    .where(eq(subscription.id, existing[0].id))
}

/**
 * Everyone who should receive an alert for a given scope/severity.
 * Returns the matching subscriptions (a user may match via portfolio + KPI).
 */
export async function subscribersForAlert(
  scope: "kpi" | "portfolio",
  kpiId: string | null,
  severity: Severity,
): Promise<SubscriptionRow[]> {
  const rank: Record<Severity, number> = { info: 0, warning: 1, critical: 2 }
  if (scope === "portfolio") {
    const rows = await db.select().from(subscription).where(eq(subscription.scope, "portfolio"))
    return rows.filter((r) => rank[r.minSeverity as Severity] <= rank[severity])
  }
  const rows = await db
    .select()
    .from(subscription)
    .where(and(eq(subscription.scope, "kpi"), eq(subscription.kpiId, kpiId as string)))
  return rows.filter((r) => rank[r.minSeverity as Severity] <= rank[severity])
}
