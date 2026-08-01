/** Shared domain types for the notification system. */

export type Severity = "info" | "warning" | "critical"
export type Scope = "kpi" | "portfolio"
export type Channel = "dashboard" | "email" | "teams"
export type Role = "viewer" | "manager" | "admin"
export type DeliveryStatus = "unread" | "read" | "sent" | "failed"
export type AlertEventType = "status_worsened" | "status_recovered" | "band_changed"

/** Severity ordering for threshold comparisons (higher = more severe). */
export const SEVERITY_RANK: Record<Severity, number> = {
  info: 0,
  warning: 1,
  critical: 2,
}

/** An identity resolved from the current request (Entra-ready). */
export type CurrentUser = {
  id: string
  email: string
  displayName: string
  role: Role
}

/** A delivery joined with its alert event, as shown in the inbox/bell. */
export type InboxItem = {
  deliveryId: string
  status: DeliveryStatus
  readAt: string | null
  createdAt: string
  channel: Channel
  event: {
    id: string
    scope: Scope
    kpiId: string | null
    eventType: AlertEventType
    severity: Severity
    title: string
    body: string
    statusFrom: string | null
    statusTo: string | null
    monthKey: string
  }
}

/** Result of a single evaluation run. */
export type EvaluationResult = {
  ranAt: string
  monthKey: string
  eventsCreated: number
  deliveriesCreated: number
  transitions: {
    scope: Scope
    kpiId: string | null
    from: string | null
    to: string
    eventType: AlertEventType
  }[]
  skipped: boolean
  reason?: string
}
