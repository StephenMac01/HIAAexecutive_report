import "server-only"

import { and, desc, eq, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { alertEvent, delivery } from "@/lib/db/schema"
import type { AlertEventType, Channel, DeliveryStatus, InboxItem, Scope, Severity } from "./types"

/**
 * Fetch a user's dashboard inbox: their dashboard-channel deliveries joined to
 * the underlying alert events, newest first.
 */
export async function getInbox(userId: string, limit = 50): Promise<InboxItem[]> {
  const rows = await db
    .select({
      deliveryId: delivery.id,
      status: delivery.status,
      readAt: delivery.readAt,
      createdAt: delivery.createdAt,
      channel: delivery.channel,
      eventId: alertEvent.id,
      scope: alertEvent.scope,
      kpiId: alertEvent.kpiId,
      eventType: alertEvent.eventType,
      severity: alertEvent.severity,
      title: alertEvent.title,
      body: alertEvent.body,
      statusFrom: alertEvent.statusFrom,
      statusTo: alertEvent.statusTo,
      monthKey: alertEvent.monthKey,
    })
    .from(delivery)
    .innerJoin(alertEvent, eq(delivery.alertEventId, alertEvent.id))
    .where(and(eq(delivery.userId, userId), eq(delivery.channel, "dashboard")))
    .orderBy(desc(delivery.createdAt))
    .limit(limit)

  return rows.map((r) => ({
    deliveryId: r.deliveryId,
    status: r.status as DeliveryStatus,
    readAt: r.readAt ? r.readAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    channel: r.channel as Channel,
    event: {
      id: r.eventId,
      scope: r.scope as Scope,
      kpiId: r.kpiId,
      eventType: r.eventType as AlertEventType,
      severity: r.severity as Severity,
      title: r.title,
      body: r.body,
      statusFrom: r.statusFrom,
      statusTo: r.statusTo,
      monthKey: r.monthKey,
    },
  }))
}

/** Count unread dashboard deliveries for the bell badge. */
export async function getUnreadCount(userId: string): Promise<number> {
  const rows = await db
    .select({ id: delivery.id })
    .from(delivery)
    .where(and(eq(delivery.userId, userId), eq(delivery.channel, "dashboard"), eq(delivery.status, "unread")))
  return rows.length
}

/** Mark specific deliveries as read (scoped to the owner). */
export async function markDeliveriesRead(userId: string, deliveryIds: string[]): Promise<number> {
  if (deliveryIds.length === 0) return 0
  const updated = await db
    .update(delivery)
    .set({ status: "read", readAt: new Date() })
    .where(and(eq(delivery.userId, userId), inArray(delivery.id, deliveryIds), eq(delivery.status, "unread")))
    .returning({ id: delivery.id })
  return updated.length
}

/** Mark every unread dashboard delivery for a user as read. */
export async function markAllRead(userId: string): Promise<number> {
  const updated = await db
    .update(delivery)
    .set({ status: "read", readAt: new Date() })
    .where(and(eq(delivery.userId, userId), eq(delivery.channel, "dashboard"), eq(delivery.status, "unread")))
    .returning({ id: delivery.id })
  return updated.length
}
