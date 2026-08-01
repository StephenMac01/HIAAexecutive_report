import "server-only"

import type { AlertEvent } from "@/lib/db/schema"
import type { Channel } from "./types"

/**
 * A delivery transport. The dashboard transport is real; email and Teams are
 * stubs gated behind feature flags until Microsoft Graph send permissions and
 * a sender mailbox are configured (Phase 3+). Keeping them behind one
 * interface means the evaluation engine fans out identically to every channel.
 */
export type Transport = {
  channel: Channel
  enabled: () => boolean
  send: (to: { userId: string; email: string }, event: AlertEvent) => Promise<"sent" | "failed">
}

const dashboardTransport: Transport = {
  channel: "dashboard",
  enabled: () => true, // dashboard delivery is the in-app inbox — always on
  send: async () => "sent", // the delivery row itself IS the dashboard message
}

const emailTransport: Transport = {
  channel: "email",
  enabled: () => process.env.NOTIFICATIONS_EMAIL_ENABLED === "true",
  send: async (to, event) => {
    // Placeholder: real Microsoft Graph sendMail lands in Phase 3.
    console.log(`[v0] (email stub) would send "${event.title}" to ${to.email}`)
    return "sent"
  },
}

const teamsTransport: Transport = {
  channel: "teams",
  enabled: () => process.env.NOTIFICATIONS_TEAMS_ENABLED === "true",
  send: async (to, event) => {
    // Placeholder: real Teams adaptive card lands in Phase 3.
    console.log(`[v0] (teams stub) would post "${event.title}" for ${to.userId}`)
    return "sent"
  },
}

export const TRANSPORTS: Record<Channel, Transport> = {
  dashboard: dashboardTransport,
  email: emailTransport,
  teams: teamsTransport,
}
