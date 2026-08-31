import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { readSession } from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/notifications/identity";
import { getInbox } from "@/lib/notifications/inbox";
import { getSubscriptionsForUser } from "@/lib/notifications/subscriptions";
import { isDatabaseConfigured } from "@/lib/db";

import { NotificationsView } from "@/components/notifications/notifications-view";
import { DbUnavailable } from "@/components/notifications/db-unavailable";

export const metadata: Metadata = {
  title: "Notifications | CNS HIAA",
  description:
    "Manage KPI alert subscriptions, review your notification inbox, and configure delivery channels.",
};

/**
 * Notifications contain live user-specific data.
 * Never statically cache this page.
 */
export const dynamic = "force-dynamic";

/**
 * CNS HIAA Notifications
 *
 * Security flow:
 *
 * Valid hiaa_session
 *      ↓
 * authenticated user
 *      ↓
 * notifications
 *
 * Missing/invalid session
 *      ↓
 * /login?next=/notifications
 */
export default async function NotificationsPage() {
  /**
   * Require a valid authenticated application session FIRST.
   *
   * readSession() now returns null when:
   * - the cookie is missing
   * - the JWT is invalid/expired
   * - the role is missing
   * - the role is invalid
   *
   * Do not fall back to Guest / Viewer.
   */
  const session = await readSession();

  if (!session) {
    redirect("/login?next=%2Fnotifications");
  }

  /**
   * At this point the user has:
   *
   * - authenticated through Microsoft Entra
   * - passed server-side token validation
   * - received a recognized App Role
   * - received a valid hiaa_session
   */
  const user = await getCurrentUser();

  /**
   * Database configuration is independent of authentication.
   *
   * We still allow the authenticated user to see a friendly
   * database unavailable screen rather than throwing.
   */
  if (!isDatabaseConfigured()) {
    return (
      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <DbUnavailable />
      </main>
    );
  }

  /**
   * Give these arrays their actual return types instead
   * of leaving TypeScript to infer never[] / any[].
   */
  let inbox: Awaited<ReturnType<typeof getInbox>> = [];
  let subscriptions: Awaited<ReturnType<typeof getSubscriptionsForUser>> = [];

  try {
    [inbox, subscriptions] = await Promise.all([
      getInbox(user.id),
      getSubscriptionsForUser(user.id),
    ]);
  } catch (err) {
    console.warn(
      "[notifications] Page data load failed:",
      err instanceof Error ? err.message : err,
    );

    return (
      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <DbUnavailable />
      </main>
    );
  }

  const portfolioSub =
    subscriptions.find((subscription) => subscription.scope === "portfolio") ??
    null;

  const kpiSubs = subscriptions.filter(
    (subscription) => subscription.scope === "kpi",
  );

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
        kpiSubscriptions={kpiSubs.map((subscription) => ({
          kpiId: subscription.kpiId as string,

          dashboard: subscription.channelDashboard,

          email: subscription.channelEmail,

          teams: subscription.channelTeams,

          minSeverity: subscription.minSeverity as never,
        }))}
      />
    </main>
  );
}
