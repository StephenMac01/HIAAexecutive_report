import "server-only"

import { randomUUID } from "crypto"
import { eq, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { alertEvent, delivery, kpiStatusSnapshot, appUser } from "@/lib/db/schema"
import { getExecutiveSummary } from "@/lib/executive-summary/aggregate"
import type { DefaultBand, KpiStatus } from "@/lib/executive-summary/types"
import { writeAudit } from "./audit"
import { subscribersForAlert } from "./subscriptions"
import { TRANSPORTS } from "./transports"
import type { AlertEventType, Channel, EvaluationResult, Severity } from "./types"

/**
 * The alert evaluation engine.
 *
 * SINGLE SOURCE OF TRUTH: it reads the exact same `getExecutiveSummary()` the
 * dashboards render, so an alert can never disagree with what the user sees.
 * It never recomputes KPI math.
 *
 * On each run it compares the current status of every KPI (and the portfolio
 * default band) against the last stored snapshot, emits a deduplicated
 * `alert_event` for each meaningful transition, and fans that event out to
 * subscribers as `delivery` rows (dashboard now; email/Teams via flagged
 * transports). Re-running with no changes is a no-op (idempotent).
 */

/** Ordering of KPI statuses so we can tell "worse" from "better". */
const STATUS_RANK: Record<KpiStatus, number> = { green: 0, amber: 1, red: 2 }
/** Ordering of portfolio default bands. */
const BAND_RANK: Record<DefaultBand, number> = { green: 0, yellow: 1, orange: 2, red: 3 }

function kpiSeverity(status: KpiStatus): Severity {
  if (status === "red") return "critical"
  if (status === "amber") return "warning"
  return "info"
}

function bandSeverity(band: DefaultBand): Severity {
  if (band === "red") return "critical"
  if (band === "orange") return "warning"
  if (band === "yellow") return "warning"
  return "info"
}

type PlannedEvent = {
  scope: "kpi" | "portfolio"
  kpiId: string | null
  eventType: AlertEventType
  severity: Severity
  title: string
  body: string
  statusFrom: string | null
  statusTo: string
  monthKey: string
  dedupeKey: string
  payload: Record<string, unknown>
}

/**
 * Evaluate all KPIs + portfolio and dispatch notifications.
 * @param actorUserId who triggered it (null for scheduled/system runs)
 */
export async function evaluateAndDispatch(actorUserId: string | null): Promise<EvaluationResult> {
  const ranAt = new Date().toISOString()

  let summary
  try {
    summary = await getExecutiveSummary()
  } catch (err) {
    console.log("[kpi] evaluate: getExecutiveSummary failed:", err instanceof Error ? err.message : err)
    return { ranAt, monthKey: "", eventsCreated: 0, deliveriesCreated: 0, transitions: [], skipped: true, reason: "summary-unavailable" }
  }

  const monthKey = summary.reportingMonthKey
  const planned: PlannedEvent[] = []

  // ---- Per-KPI transitions -------------------------------------------------
  for (const c of summary.contributions) {
    if (!c.available) continue // don't alert on data we couldn't load
    const prev = await readSnapshot("kpi", c.id)
    const prevStatus = (prev?.status as KpiStatus | undefined) ?? null
    const currStatus = c.status

    if (prevStatus && prevStatus !== currStatus) {
      const worsened = STATUS_RANK[currStatus] > STATUS_RANK[prevStatus]
      const severity = worsened ? kpiSeverity(currStatus) : "info"
      planned.push({
        scope: "kpi",
        kpiId: c.id,
        eventType: worsened ? "status_worsened" : "status_recovered",
        severity,
        title: `${c.code} ${worsened ? "worsened" : "recovered"}: ${prevStatus} → ${currStatus}`,
        body: worsened
          ? `${c.name} moved from ${prevStatus.toUpperCase()} to ${currStatus.toUpperCase()} for ${summary.reportingMonth}. Reported: ${c.actual}. Month damage: ${c.monthDamage}.`
          : `${c.name} improved from ${prevStatus.toUpperCase()} to ${currStatus.toUpperCase()} for ${summary.reportingMonth}. Reported: ${c.actual}.`,
        statusFrom: prevStatus,
        statusTo: currStatus,
        monthKey,
        dedupeKey: `kpi:${c.id}:${monthKey}:${prevStatus}->${currStatus}`,
        payload: { actual: c.actual, monthDamage: c.monthDamage, periodDamage: c.periodDamage },
      })
    }

    await writeSnapshot("kpi", c.id, monthKey, currStatus, null, c.monthDamage)
  }

  // ---- Portfolio default-band transition ----------------------------------
  {
    const prev = await readSnapshot("portfolio", null)
    const prevBand = (prev?.band as DefaultBand | undefined) ?? null
    const currBand = summary.defaultBand
    if (prevBand && prevBand !== currBand) {
      const worsened = BAND_RANK[currBand] > BAND_RANK[prevBand]
      planned.push({
        scope: "portfolio",
        kpiId: null,
        eventType: "band_changed",
        severity: worsened ? bandSeverity(currBand) : "info",
        title: `Portfolio Event-of-Default band ${worsened ? "escalated" : "eased"}: ${prevBand} → ${currBand}`,
        body: `The rolling 6-month damage band changed from ${prevBand.toUpperCase()} to ${currBand.toUpperCase()} (${summary.rollingSixMonthDamage} pts vs threshold ${summary.defaultThreshold}) for ${summary.reportingMonth}.`,
        statusFrom: prevBand,
        statusTo: currBand,
        monthKey,
        dedupeKey: `portfolio:${monthKey}:${prevBand}->${currBand}`,
        payload: { rollingSixMonthDamage: summary.rollingSixMonthDamage, defaultThreshold: summary.defaultThreshold },
      })
    }
    await writeSnapshot("portfolio", null, monthKey, currBand, currBand, summary.rollingSixMonthDamage)
  }

  // ---- Persist events + fan out to subscribers ----------------------------
  let eventsCreated = 0
  let deliveriesCreated = 0
  const transitions: EvaluationResult["transitions"] = []

  for (const p of planned) {
    const eventId = randomUUID()
    // Insert the event; the unique dedupeKey makes concurrent/repeat runs safe.
    const inserted = await db
      .insert(alertEvent)
      .values({
        id: eventId,
        scope: p.scope,
        kpiId: p.kpiId,
        eventType: p.eventType,
        severity: p.severity,
        title: p.title,
        body: p.body,
        statusFrom: p.statusFrom,
        statusTo: p.statusTo,
        monthKey: p.monthKey,
        dedupeKey: p.dedupeKey,
        payload: p.payload,
      })
      .onConflictDoNothing({ target: alertEvent.dedupeKey })
      .returning({ id: alertEvent.id })

    if (inserted.length === 0) continue // already emitted this transition
    eventsCreated++
    transitions.push({ scope: p.scope, kpiId: p.kpiId, from: p.statusFrom, to: p.statusTo, eventType: p.eventType })

    const subs = await subscribersForAlert(p.scope, p.kpiId, p.severity)
    // Collapse per-user so a user matching multiple subs gets one delivery/channel.
    const perUser = new Map<string, { dashboard: boolean; email: boolean; teams: boolean }>()
    for (const s of subs) {
      const cur = perUser.get(s.userId) ?? { dashboard: false, email: false, teams: false }
      perUser.set(s.userId, {
        dashboard: cur.dashboard || s.channelDashboard,
        email: cur.email || s.channelEmail,
        teams: cur.teams || s.channelTeams,
      })
    }

    for (const [userId, channels] of perUser) {
      const userRow = await db.select().from(appUser).where(eq(appUser.id, userId)).limit(1)
      const email = userRow[0]?.email ?? ""
      const wanted: Channel[] = []
      if (channels.dashboard) wanted.push("dashboard")
      if (channels.email) wanted.push("email")
      if (channels.teams) wanted.push("teams")

      const eventRow = {
        id: eventId,
        scope: p.scope,
        kpiId: p.kpiId,
        eventType: p.eventType,
        severity: p.severity,
        title: p.title,
        body: p.body,
        statusFrom: p.statusFrom,
        statusTo: p.statusTo,
        monthKey: p.monthKey,
        dedupeKey: p.dedupeKey,
        payload: p.payload,
        createdAt: new Date(),
      }

      for (const channel of wanted) {
        const transport = TRANSPORTS[channel]
        if (!transport.enabled()) continue
        let status: "unread" | "sent" | "failed" = "unread"
        if (channel !== "dashboard") {
          status = await transport.send({ userId, email }, eventRow)
        }
        await db.insert(delivery).values({
          id: randomUUID(),
          alertEventId: eventId,
          userId,
          channel,
          status,
        })
        deliveriesCreated++
      }
    }
  }

  await writeAudit({
    actorUserId,
    action: "notifications.evaluate",
    entityType: "evaluation",
    metadata: { monthKey, eventsCreated, deliveriesCreated },
  })

  return { ranAt, monthKey, eventsCreated, deliveriesCreated, transitions, skipped: false }
}

// --- snapshot helpers -------------------------------------------------------

async function readSnapshot(scope: "kpi" | "portfolio", kpiId: string | null) {
  const rows = await db
    .select()
    .from(kpiStatusSnapshot)
    .where(
      kpiId === null
        ? sql`${kpiStatusSnapshot.scope} = ${scope} and ${kpiStatusSnapshot.kpiId} is null`
        : sql`${kpiStatusSnapshot.scope} = ${scope} and ${kpiStatusSnapshot.kpiId} = ${kpiId}`,
    )
    .limit(1)
  return rows[0]
}

async function writeSnapshot(
  scope: "kpi" | "portfolio",
  kpiId: string | null,
  monthKey: string,
  status: string,
  band: string | null,
  damage: number,
) {
  const existing = await readSnapshot(scope, kpiId)
  if (existing) {
    await db
      .update(kpiStatusSnapshot)
      .set({ monthKey, status, band, damage: String(damage), updatedAt: new Date() })
      .where(eq(kpiStatusSnapshot.id, existing.id))
  } else {
    await db.insert(kpiStatusSnapshot).values({
      id: randomUUID(),
      scope,
      kpiId,
      monthKey,
      status,
      band,
      damage: String(damage),
    })
  }
}
