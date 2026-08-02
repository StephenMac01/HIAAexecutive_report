import "server-only"

import { getCurrentUser } from "./identity"
import { hasRole } from "./types"
import type { CurrentUser, Role } from "./types"

/**
 * Role-based access control.
 *
 * Roles are hierarchical: admin ⊇ manager ⊇ viewer. Access is sourced from
 * Entra App Roles in production (see lib/auth/easy-auth.ts) and from the dev
 * identity locally. Per the Phase 3 decision, every authenticated user can
 * VIEW all KPIs; roles gate privileged capabilities (running evaluations,
 * assignment, audit review) rather than which KPIs are visible.
 */

/** Human-readable capability summary per role (shared by UI + docs). */
export const ROLE_CAPABILITIES: Record<Role, string> = {
  viewer: "View dashboards and manage your own alert subscriptions.",
  manager: "Everything a viewer can do, plus run evaluations and acknowledge alerts.",
  admin: "Full access, including assigning subscriptions and reviewing the audit log.",
}

/** Thrown when the current user lacks the required role. */
export class AuthorizationError extends Error {
  readonly status = 403
  constructor(public readonly required: Role, public readonly actual: Role) {
    super(`Requires ${required} role (you have ${actual}).`)
    this.name = "AuthorizationError"
  }
}

/**
 * Resolve the current user and assert they meet `required`. Throws
 * AuthorizationError otherwise. Use at the top of privileged server actions and
 * route handlers.
 */
export async function requireRole(required: Role): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!hasRole(user.role, required)) {
    throw new AuthorizationError(required, user.role)
  }
  return user
}
