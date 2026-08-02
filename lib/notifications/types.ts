/** Shared domain types for the notification system. */

export type Severity = "info" | "warning" | "critical"
export type Scope = "kpi" | "portfolio"
export type Channel = "dashboard" | "email" | "teams"
export type Role = "viewer" | "manager" | "admin"

/** Role hierarchy: admin ⊇ manager ⊇ viewer. Client-safe (pure). */
export const ROLE_RANK: Record<Role, number> = {
  viewer: 0,
  manager: 1,
  admin: 2,
}

/** True when `role` meets or exceeds `required`. Safe to use on client + server. */
export function hasRole(role: Role, required: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[required]
}
export type DeliveryStatus = "unread" | "read" | "sent" | "failed"
export type AlertEventType = "status_worsened" | "status_recovered" | "band_changed"

/** Severity ordering for threshold comparisons (higher = more severe). */
export const SEVERITY_RANK: Record<Severity, number> = {
  info: 0,
  warning: 1,
  critical: 2,
}

/** How the current identity was resolved for this request. */
export type AuthSource = "entra" | "dev"

/** An identity resolved from the current request (Entra-ready). */
export type CurrentUser = {
  id: string
  email: string
  displayName: string
  role: Role
  /** "entra" when signed in via App Service Easy Auth, "dev" for the local fallback. */
  authSource: AuthSource
  /** Raw Entra App Role values, when signed in via Entra. */
  appRoles?: string[]
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
