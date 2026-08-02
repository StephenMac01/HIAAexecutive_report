import "server-only"

import { eq } from "drizzle-orm"
import { db, isDatabaseConfigured } from "@/lib/db"
import { appUser } from "@/lib/db/schema"
import { readEntraIdentity } from "@/lib/auth/easy-auth"
import type { CurrentUser, Role } from "./types"

/**
 * Pluggable identity resolution.
 *
 * Production: Microsoft Entra ID via Azure App Service "Easy Auth". The
 * platform validates the login and injects the principal as request headers,
 * which `readEntraIdentity()` decodes. The identity is keyed by the Entra
 * object id (`oid`) and the role comes from Entra App Roles.
 *
 * Local dev / v0 preview: no Easy Auth in front of the app, so we fall back to
 * a configurable dev identity from env vars. Everything downstream
 * (subscriptions, deliveries, audit) keys off `CurrentUser.id`, so the rest of
 * the system is identical in both modes.
 */

const DEV_DEFAULTS = {
  id: "dev-user-001",
  email: "stephen.macneil@hiaa.example",
  displayName: "Stephen MacNeil",
  role: "admin" as Role,
}

function normalizeRole(value: string | undefined, fallback: Role): Role {
  return value && ["viewer", "manager", "admin"].includes(value) ? (value as Role) : fallback
}

function devIdentity(): CurrentUser {
  const role = normalizeRole(
    process.env.NOTIFY_DEV_USER_ROLE || process.env.DEV_IDENTITY_ROLE,
    DEV_DEFAULTS.role,
  )
  return {
    id: process.env.NOTIFY_DEV_USER_ID || process.env.DEV_IDENTITY_ID || DEV_DEFAULTS.id,
    email: process.env.NOTIFY_DEV_USER_EMAIL || process.env.DEV_IDENTITY_EMAIL || DEV_DEFAULTS.email,
    displayName: process.env.NOTIFY_DEV_USER_NAME || process.env.DEV_IDENTITY_NAME || DEV_DEFAULTS.displayName,
    role,
    authSource: "dev",
  }
}

/**
 * Resolve the raw identity for this request: Entra when Easy Auth is present,
 * otherwise the dev fallback.
 */
async function resolveIdentity(): Promise<CurrentUser> {
  const entra = await readEntraIdentity()
  if (entra) {
    return {
      id: entra.oid,
      email: entra.email,
      displayName: entra.displayName,
      role: entra.role,
      authSource: "entra",
      appRoles: entra.appRoles,
    }
  }
  return devIdentity()
}

/**
 * Resolve the current user and ensure a matching `app_user` row exists.
 *
 * Role-of-record rules:
 *  - Entra sign-in: Entra App Roles are authoritative. The DB row is synced to
 *    the role from the directory on every request.
 *  - Dev fallback: the in-app/DB role is preserved (never downgraded by the env
 *    default), so manual role assignment in the app survives.
 *
 * Falls back to the in-memory identity when the database is unavailable so the
 * UI still renders (deliveries simply won't be queryable).
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const identity = await resolveIdentity()
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
      return identity
    }

    if (identity.authSource === "entra") {
      // Entra is the source of truth — keep profile + role in sync.
      await db
        .update(appUser)
        .set({
          email: identity.email,
          displayName: identity.displayName,
          role: identity.role,
          updatedAt: new Date(),
        })
        .where(eq(appUser.id, identity.id))
      return identity
    }

    // Dev fallback: refresh profile fields but keep the DB-assigned role.
    await db
      .update(appUser)
      .set({ email: identity.email, displayName: identity.displayName, updatedAt: new Date() })
      .where(eq(appUser.id, identity.id))
    return { ...identity, role: (existing[0].role as Role) ?? identity.role }
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
