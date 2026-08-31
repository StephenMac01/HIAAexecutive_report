"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/notifications/identity";
import {
  getInbox,
  getUnreadCount,
  markAllRead,
  markDeliveriesRead,
} from "@/lib/notifications/inbox";

import {
  getSubscriptionsForUser,
  upsertKpiSubscription,
  upsertPortfolioSubscription,
} from "@/lib/notifications/subscriptions";

import { evaluateAndDispatch } from "@/lib/notifications/evaluate";
import { writeAudit } from "@/lib/notifications/audit";

import { AuthorizationError, requireRole } from "@/lib/notifications/rbac";

import type {
  CurrentUser,
  InboxItem,
  Severity,
} from "@/lib/notifications/types";

/**
 * Require a real authenticated Microsoft Entra user.
 *
 * getCurrentUser() returns null when:
 * - there is no valid hiaa_session
 * - the session is expired
 * - the session signature is invalid
 * - the session contains no recognized application role
 *
 * Server actions must fail closed rather than creating
 * a Guest / Viewer fallback.
 */
async function requireCurrentUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthorizationError("viewer", "viewer");
  }

  return user;
}

/**
 * Retrieve the signed-in user's notification inbox.
 */
export async function fetchInbox(): Promise<{
  items: InboxItem[];
  unread: number;
}> {
  const user = await requireCurrentUser();

  const [items, unread] = await Promise.all([
    getInbox(user.id),
    getUnreadCount(user.id),
  ]);

  return {
    items,
    unread,
  };
}

/**
 * Mark selected notification deliveries as read.
 */
export async function markRead(deliveryIds: string[]): Promise<number> {
  const user = await requireCurrentUser();

  const count = await markDeliveriesRead(user.id, deliveryIds);

  revalidatePath("/notifications");

  return count;
}

/**
 * Mark all notifications as read for the
 * authenticated user.
 */
export async function markAllNotificationsRead(): Promise<number> {
  const user = await requireCurrentUser();

  const count = await markAllRead(user.id);

  revalidatePath("/notifications");

  return count;
}

/**
 * Retrieve subscriptions belonging to the
 * authenticated user.
 */
export async function fetchSubscriptions() {
  const user = await requireCurrentUser();

  return getSubscriptionsForUser(user.id);
}

/**
 * Save an individual KPI subscription.
 */
export async function saveKpiSubscription(
  kpiId: string,
  prefs: {
    dashboard: boolean;
    email: boolean;
    teams: boolean;
    minSeverity: Severity;
  },
) {
  const user = await requireCurrentUser();

  await upsertKpiSubscription(user.id, kpiId, prefs);

  await writeAudit({
    actorUserId: user.id,
    action: "subscription.update",
    entityType: "subscription",
    entityId: `kpi:${kpiId}`,
    metadata: prefs,
  });

  revalidatePath("/notifications");
}

/**
 * Save the authenticated user's
 * portfolio-wide notification preferences.
 */
export async function savePortfolioSubscription(prefs: {
  dashboard: boolean;
  email: boolean;
  teams: boolean;
  minSeverity: Severity;
}) {
  const user = await requireCurrentUser();

  await upsertPortfolioSubscription(user.id, prefs);

  await writeAudit({
    actorUserId: user.id,
    action: "subscription.update",
    entityType: "subscription",
    entityId: "portfolio",
    metadata: prefs,
  });

  revalidatePath("/notifications");
}

/**
 * Manual "Check now" trigger from the UI.
 *
 * Portfolio-wide notification evaluation
 * requires Manager or Administrator.
 */
export async function runEvaluationNow(): Promise<{
  skipped: boolean;
  eventsCreated: number;
  error?: string;
}> {
  try {
    const user = await requireRole("manager");

    const result = await evaluateAndDispatch(user.id);

    revalidatePath("/notifications");

    return result;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return {
        skipped: true,
        eventsCreated: 0,
        error: "You need a Manager or Administrator role to run an evaluation.",
      };
    }

    const cause =
      error instanceof Error && "cause" in error
        ? (error as { cause?: unknown }).cause
        : undefined;

    const message = `${error instanceof Error ? error.message : String(error)}${
      cause
        ? ` | cause: ${cause instanceof Error ? cause.message : String(cause)}`
        : ""
    }`;

    console.warn("[notifications] runEvaluationNow failed:", message);

    return {
      skipped: true,
      eventsCreated: 0,
      error: message,
    };
  }
}
