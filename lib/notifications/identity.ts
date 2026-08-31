import "server-only";

import { eq } from "drizzle-orm";

import { db, isDatabaseConfigured } from "@/lib/db";

import { appUser } from "@/lib/db/schema";

import { readSession } from "@/lib/auth/session";

import { isMsalEnabled } from "@/lib/auth/msal-config";

import type { CurrentUser, Role } from "./types";

/**
 * Pluggable identity resolution.
 *
 * MSAL mode:
 * - Browser authenticates with Microsoft Entra ID
 * - /api/auth/session verifies the Entra access token
 * - Server creates the signed hiaa_session cookie
 * - readSession() reads and verifies that cookie here
 *
 * Dev mode:
 * - Uses a configurable development identity
 *
 * The rest of the application always works with CurrentUser.
 */

const DEV_DEFAULTS = {
  id: "dev-user-001",
  email: "dev-user@example.local",
  displayName: "Development User",
  role: "admin" as Role,
};

/**
 * Normalize a role string to one of the supported internal roles.
 */
function normalizeRole(value: string | undefined, fallback: Role): Role {
  if (value && ["viewer", "manager", "admin"].includes(value)) {
    return value as Role;
  }

  return fallback;
}

/**
 * Development identity.
 *
 * Used only when NEXT_PUBLIC_AUTH_MODE !== "msal".
 */
function devIdentity(): CurrentUser {
  const role = normalizeRole(
    process.env.NOTIFY_DEV_USER_ROLE || process.env.DEV_IDENTITY_ROLE,
    DEV_DEFAULTS.role,
  );

  return {
    id:
      process.env.NOTIFY_DEV_USER_ID ||
      process.env.DEV_IDENTITY_ID ||
      DEV_DEFAULTS.id,

    email:
      process.env.NOTIFY_DEV_USER_EMAIL ||
      process.env.DEV_IDENTITY_EMAIL ||
      DEV_DEFAULTS.email,

    displayName:
      process.env.NOTIFY_DEV_USER_NAME ||
      process.env.DEV_IDENTITY_NAME ||
      DEV_DEFAULTS.displayName,

    role,

    authSource: "dev",

    appRoles: [],
  };
}

/**
 * Signed-out identity.
 *
 * This is used in MSAL mode when no valid hiaa_session cookie exists.
 *
 * Important:
 * The "viewer" role here must NOT be treated as authenticated access.
 * API guards must check authSource === "anonymous" before checking roles.
 */
function anonymousIdentity(): CurrentUser {
  return {
    id: "anonymous",
    email: "",
    displayName: "Guest",
    role: "viewer",
    authSource: "anonymous",
    appRoles: [],
  };
}

/**
 * Resolve the raw identity for the current request.
 *
 * MSAL enabled:
 *   valid session -> Entra identity
 *   no session    -> anonymous identity
 *
 * MSAL disabled:
 *   development identity
 */
async function resolveIdentity(): Promise<CurrentUser> {
  if (isMsalEnabled) {
    const session = await readSession();

    if (!session) {
      return anonymousIdentity();
    }

    return {
      id: session.id,
      email: session.email,
      displayName: session.displayName,
      role: session.role,
      authSource: "entra",
      appRoles: session.appRoles,
    };
  }

  return devIdentity();
}

/**
 * Resolve the current user and synchronize the app_user record.
 *
 * Role rules:
 *
 * Entra:
 * - Entra App Roles are authoritative
 * - Database role is synchronized from the authenticated session
 *
 * Development:
 * - Database role is preserved when a user row already exists
 * - Allows role testing/admin changes without being overwritten
 *
 * Database unavailable:
 * - Returns the in-memory identity
 * - Authentication can still resolve
 * - DB-backed features such as notifications may not function
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const identity = await resolveIdentity();

  /**
   * Never persist an anonymous visitor.
   */
  if (identity.authSource === "anonymous") {
    return identity;
  }

  /**
   * Authentication must not fail merely because the database
   * is not configured.
   */
  if (!isDatabaseConfigured()) {
    return identity;
  }

  try {
    const existing = await db
      .select()
      .from(appUser)
      .where(eq(appUser.id, identity.id))
      .limit(1);

    /**
     * First login / first appearance of this identity.
     */
    if (existing.length === 0) {
      await db.insert(appUser).values({
        id: identity.id,
        email: identity.email,
        displayName: identity.displayName,
        role: identity.role,
      });

      return identity;
    }

    /**
     * Entra-authenticated user.
     *
     * Entra is the source of truth for the user's profile
     * and authorization role.
     */
    if (identity.authSource === "entra") {
      await db
        .update(appUser)
        .set({
          email: identity.email,
          displayName: identity.displayName,
          role: identity.role,
          updatedAt: new Date(),
        })
        .where(eq(appUser.id, identity.id));

      return identity;
    }

    /**
     * Development identity.
     *
     * Update profile values, but retain the role already stored
     * in the database.
     */
    await db
      .update(appUser)
      .set({
        email: identity.email,
        displayName: identity.displayName,
        updatedAt: new Date(),
      })
      .where(eq(appUser.id, identity.id));

    return {
      ...identity,

      role: (existing[0].role as Role) ?? identity.role,
    };
  } catch (error) {
    /**
     * Authentication should still resolve even if PostgreSQL
     * is unavailable.
     *
     * DB-backed notification functionality may fail separately,
     * but a database outage should not destroy the user's
     * authenticated identity.
     */
    const cause =
      error instanceof Error && "cause" in error
        ? (
            error as {
              cause?: unknown;
            }
          ).cause
        : undefined;

    console.error(
      "[auth] getCurrentUser database synchronization failed:",
      error instanceof Error ? error.message : error,
      "| cause:",
      cause instanceof Error ? cause.message : cause,
    );

    return identity;
  }
}
