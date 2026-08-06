import "server-only";

import { eq } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/lib/db";
import { appUser } from "@/lib/db/schema";
import { readEntraIdentity } from "@/lib/auth/easy-auth";
import type { CurrentUser, Role } from "./types";

/**
 * Identity resolution:
 *
 * Production:
 *   Microsoft Entra ID through Azure App Service Authentication.
 *
 * Local development:
 *   Configurable development identity.
 *
 * Production must never silently fall back to a hard-coded user.
 */

const DEV_DEFAULTS = {
  id: "dev-user-001",
  email: "developer@localhost",
  displayName: "Development User",
  role: "admin" as Role,
};

function normalizeRole(value: string | undefined, fallback: Role): Role {
  return value && ["viewer", "manager", "admin"].includes(value)
    ? (value as Role)
    : fallback;
}

function isLocalDevelopment(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.ALLOW_DEV_IDENTITY === "true"
  );
}

function devIdentity(): CurrentUser {
  const role = normalizeRole(
    process.env.NOTIFY_DEV_USER_ROLE ?? process.env.DEV_IDENTITY_ROLE,
    DEV_DEFAULTS.role,
  );

  return {
    id:
      process.env.NOTIFY_DEV_USER_ID ??
      process.env.DEV_IDENTITY_ID ??
      DEV_DEFAULTS.id,

    email:
      process.env.NOTIFY_DEV_USER_EMAIL ??
      process.env.DEV_IDENTITY_EMAIL ??
      DEV_DEFAULTS.email,

    displayName:
      process.env.NOTIFY_DEV_USER_NAME ??
      process.env.DEV_IDENTITY_NAME ??
      DEV_DEFAULTS.displayName,

    role,
    authSource: "dev",
  };
}

/**
 * Resolve the identity attached to the current request.
 *
 * In Azure, missing Easy Auth headers are treated as an authentication
 * configuration failure—not as permission to impersonate the development user.
 */
async function resolveIdentity(): Promise<CurrentUser> {
  const entra = await readEntraIdentity();

  if (entra) {
    return {
      id: entra.oid,
      email: entra.email,
      displayName: entra.displayName,
      role: entra.role ?? "viewer",
      authSource: "entra",
      appRoles: entra.appRoles,
    };
  }

  if (isLocalDevelopment()) {
    return devIdentity();
  }

  throw new Error(
    [
      "Authenticated Entra identity was not found.",
      "Verify Azure App Service Authentication is enabled,",
      "unauthenticated requests require authentication,",
      "and Easy Auth identity headers are reaching Next.js.",
    ].join(" "),
  );
}

/**
 * Resolve the current user and ensure that a corresponding app_user row exists.
 *
 * Rules:
 *
 * - Entra object ID is the stable database user ID.
 * - Existing database roles are preserved unless Entra supplied an explicit
 *   application role.
 * - New users default to viewer when no recognized Entra app role exists.
 * - Profile fields are refreshed whenever the person signs in.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const identity = await resolveIdentity();

  if (!isDatabaseConfigured()) {
    return identity;
  }

  try {
    const existingRows = await db
      .select()
      .from(appUser)
      .where(eq(appUser.id, identity.id))
      .limit(1);

    const existing = existingRows[0];

    if (!existing) {
      await db.insert(appUser).values({
        id: identity.id,
        email: identity.email,
        displayName: identity.displayName,
        role: identity.role ?? "viewer",
      });

      return identity;
    }

    /*
     * Preserve the database role unless Entra actually supplied one of the
     * application's recognized app roles.
     *
     * This prevents every ordinary Entra user from overwriting a manually
     * assigned manager/admin role with "viewer".
     */
    const hasExplicitEntraRole =
      identity.authSource === "entra" &&
      Array.isArray(identity.appRoles) &&
      identity.appRoles.length > 0;

    const effectiveRole: Role = hasExplicitEntraRole
      ? identity.role
      : ((existing.role as Role) ?? "viewer");

    await db
      .update(appUser)
      .set({
        email: identity.email,
        displayName: identity.displayName,
        role: effectiveRole,
        updatedAt: new Date(),
      })
      .where(eq(appUser.id, identity.id));

    return {
      ...identity,
      role: effectiveRole,
    };
  } catch (error) {
    const cause =
      error instanceof Error && "cause" in error
        ? (error as { cause?: unknown }).cause
        : undefined;

    console.error(
      "[identity] getCurrentUser database synchronization failed:",
      error instanceof Error ? error.message : error,
      "| cause:",
      cause instanceof Error ? cause.message : cause,
    );

    /*
     * Authentication succeeded even though profile persistence failed.
     * Return the actual Entra identity rather than replacing it.
     */
    return identity;
  }
}
