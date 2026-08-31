import "server-only"

import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/notifications/identity"
import { hasRole } from "@/lib/notifications/types"
import type { CurrentUser, Role } from "@/lib/notifications/types"
import { isMsalEnabled } from "@/lib/auth/msal-config"

/**
 * Route-handler authorization guard.
 *
 * Server Components rely on `proxy.ts` (presence gate) + `requireRole()` in the
 * notifications lib. API routes are deliberately NOT redirected by the proxy,
 * so each user-facing route must enforce its own auth. This guard is the single
 * place that logic lives.
 *
 * Two failure modes, distinct HTTP codes:
 *   - 401 Unauthorized: no signed-in identity (MSAL mode, anonymous session).
 *   - 403 Forbidden:    signed in but the role is insufficient.
 *
 * A subtle trap this closes: the anonymous identity defaults to the "viewer"
 * role, so a naive `requireRole("viewer")` would PASS for a signed-out caller.
 * We check `authSource` first so anonymous is always rejected in MSAL mode.
 *
 * In dev mode (NEXT_PUBLIC_AUTH_MODE !== "msal") the dev identity is admin, so
 * these guards pass — the v0 preview and local development keep working without
 * an Entra tenant. Enforcement only "turns on" once MSAL mode is enabled.
 */

export type GuardResult =
  | { ok: true; user: CurrentUser }
  | { ok: false; response: NextResponse }

const unauthorized = () =>
  NextResponse.json({ error: "Authentication required." }, { status: 401 })

const forbidden = (required: Role, actual: Role) =>
  NextResponse.json(
    { error: `Requires ${required} role (you have ${actual}).` },
    { status: 403 },
  )

/**
 * Require a signed-in user (any role). Returns the user, or a 401 response.
 */
export async function requireApiUser(): Promise<GuardResult> {
  const user = await getCurrentUser()
  if (isMsalEnabled && user.authSource === "anonymous") {
    return { ok: false, response: unauthorized() }
  }
  return { ok: true, user }
}

/**
 * Require a signed-in user with at least `required` role. Returns the user, or
 * a 401 (not signed in) / 403 (insufficient role) response.
 */
export async function requireApiRole(required: Role): Promise<GuardResult> {
  const gate = await requireApiUser()
  if (!gate.ok) return gate
  if (!hasRole(gate.user.role, required)) {
    return { ok: false, response: forbidden(required, gate.user.role) }
  }
  return gate
}
