import type { Metadata } from "next";
import { redirect } from "next/navigation";

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
 * Notifications contain live, user-specific information.
 * Never statically cache this page.
 */
export const dynamic = "force-dynamic";

/**
 * CNS HIAA Notifications
 *
 * Production security model:
 *
 * No valid session
 *      ↓
 * /login?next=/notifications
 *
 * Valid Entra session
 *      ↓
 * Administrator / Manager / Viewer
 *      ↓
 * Notifications
 *
 * There is NO Guest or anonymous fallback.
 */
export default async function NotificationsPage() {
  /**
   * Resolve the authenticated Microsoft Entra identity.
   *
   * getCurrentUser() returns null when:
   *
   * - hiaa_session is missing
   * - session is expired
   * - session signature is invalid
   * - session contains no recognized application role
   */
  const user = await getCurrentUser();

  /**
   * Fail closed.
   *
   * Never substitute Guest or Viewer when authentication
   * is missing or invalid.
   */
  if (!user) {
    redirect("/login?next=%2Fnotifications");
  }

  /**
   * Authentication succeeded, but notification features
   * require PostgreSQL.
   *
   * The authenticated user remains valid even if the
   * database is temporarily unavailable.
   */
  if (!isDatabaseConfigured()) {
    return (
      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <DbUnavailable />
      </main>
    );
  }

  /**
   * Explicit result types prevent [] from being inferred
   * incorrectly and keep the component props type-safe.
   */
  let inbox: Awaited<ReturnType<typeof getInbox>> = [];

  let subscriptions: Awaited<ReturnType<typeof getSubscriptionsForUser>> = [];

  try {
    [inbox, subscriptions] = await Promise.all([
      getInbox(user.id),
      getSubscriptionsForUser(user.id),
    ]);
  } catch (error) {
    console.warn(
      "[notifications] Unable to load notification data:",
      error instanceof Error ? error.message : error,
    );

    return (
      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <DbUnavailable />
      </main>
    );
  }

  /**
   * Separate the portfolio-wide subscription from
   * individual KPI subscriptions.
   */
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
