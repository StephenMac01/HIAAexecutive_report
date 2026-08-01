import "server-only"

import { eq } from "drizzle-orm"
import { db, isDatabaseConfigured } from "@/lib/db"
import { appUser } from "@/lib/db/schema"
import type { CurrentUser, Role } from "./types"

/**
 * Pluggable identity resolution.
 *
 * Today the "signed-in user" comes from configurable dev-identity env vars so
 * the notification system is fully functional without an Entra login wired up.
 * When interactive Entra ID / MSAL sign-in is added later, only
 * `resolveIdentity()` needs to change — it must return the same shape keyed by
 * the Entra object id (`oid`). Everything downstream (subscriptions,
 * deliveries, audit) already keys off `CurrentUser.id`.
 */

const DEV_DEFAULTS = {
  id: "dev-user-001",
  email: "stephen.macneil@hiaa.example",
  displayName: "Stephen MacNeil",
  role: "admin" as Role,
}

function resolveIdentity(): CurrentUser {
  // Support both NOTIFY_DEV_USER_* (documented in .env.example) and the older
  // DEV_IDENTITY_* names so either works.
  const role = (process.env.NOTIFY_DEV_USER_ROLE || process.env.DEV_IDENTITY_ROLE || DEV_DEFAULTS.role) as Role
  return {
    id: process.env.NOTIFY_DEV_USER_ID || process.env.DEV_IDENTITY_ID || DEV_DEFAULTS.id,
    email: process.env.NOTIFY_DEV_USER_EMAIL || process.env.DEV_IDENTITY_EMAIL || DEV_DEFAULTS.email,
    displayName: process.env.NOTIFY_DEV_USER_NAME || process.env.DEV_IDENTITY_NAME || DEV_DEFAULTS.displayName,
    role: ["viewer", "manager", "admin"].includes(role) ? role : "viewer",
  }
}

/**
 * Resolve the current user and ensure a matching `app_user` row exists.
 * Falls back to the in-memory identity when the database is unavailable so the
 * UI still renders (deliveries simply won't be queryable).
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const identity = resolveIdentity()
  if (!isDatabaseConfigured()) return identity

  try {
    const existing = await db.select().from(appUser).where(eq(appUser.id, identity.id)).limit(1)
    if (existing.length === 0) {
      await db.insert(appUser).values({
        id: identity.id,
        email: identity.email,
        displayName: identity.displayName,
        role: identity.role,
      })
    } else {
      // Keep profile fields fresh, but never downgrade a role assigned in-app.
      await db
        .update(appUser)
        .set({ email: identity.email, displayName: identity.displayName, updatedAt: new Date() })
        .where(eq(appUser.id, identity.id))
      return { ...identity, role: (existing[0].role as Role) ?? identity.role }
    }
  } catch (err) {
    const cause = err instanceof Error && "cause" in err ? (err as { cause?: unknown }).cause : undefined
    console.log(
      "[v0] getCurrentUser upsert failed:",
      err instanceof Error ? err.message : err,
      "| cause:",
      cause instanceof Error ? cause.message : cause,
    )
  }
  return identity
}
