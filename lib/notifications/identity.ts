import "server-only";

import { eq } from "drizzle-orm";

import { db, isDatabaseConfigured } from "@/lib/db";
import { appUser } from "@/lib/db/schema";
import { readSession } from "@/lib/auth/session";

import type { CurrentUser } from "./types";

/**
 * Production identity resolution.
 *
 * Microsoft Entra ID is the only identity provider.
 *
 * Flow:
 *
 * Browser signs in with Microsoft Entra
 *   -> /api/auth/session verifies the Entra access token
 *   -> server creates signed hiaa_session cookie
 *   -> readSession() verifies that cookie
 *   -> this module returns the authenticated Entra identity
 *
 * There is NO guest identity and NO development identity fallback.
 */

/**
 * Resolve the current authenticated identity.
 *
 * Returns null when:
 * - there is no hiaa_session cookie
 * - the session is expired
 * - the session signature is invalid
 * - the session has no valid role
 */
async function resolveIdentity(): Promise<CurrentUser | null> {
  const session = await readSession();

  if (!session) {
    return null;
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

/**
 * Resolve the current authenticated user and synchronize app_user.
 *
 * Microsoft Entra ID is authoritative for:
 * - identity
 * - display name
 * - email
 * - application role
 *
 * PostgreSQL stores the synchronized application profile.
 *
 * Database availability does not determine authentication.
 * If PostgreSQL is unavailable, the authenticated Entra identity
 * is still returned.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const identity = await resolveIdentity();

  if (!identity) {
    return null;
  }

  /**
   * Authentication has already succeeded.
   *
   * If PostgreSQL is unavailable, return the verified Entra identity.
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
     * First authenticated login.
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
     * Entra is the source of truth.
     *
     * Keep the database profile synchronized with the
     * current authenticated Entra identity and App Role.
     */
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
  } catch (error) {
    const cause =
      error instanceof Error && "cause" in error
        ? (error as { cause?: unknown }).cause
        : undefined;

    console.error(
      "[auth] getCurrentUser database synchronization failed:",
      error instanceof Error ? error.message : error,
      "| cause:",
      cause instanceof Error ? cause.message : cause,
    );

    /**
     * Authentication remains valid even if the application
     * database is temporarily unavailable.
     */
    return identity;
  }
}
