import "server-only";

import type { Role } from "@/lib/notifications/types";
import { requireEntraIdentity, type EntraIdentity } from "@/lib/auth/easy-auth";

const VALID_DEV_ROLES = new Set<Role>(["admin", "manager", "viewer"]);

function developmentIdentityEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.ALLOW_DEV_IDENTITY === "true"
  );
}

function readDevelopmentRole(): Role {
  const configuredRole = process.env.DEV_IDENTITY_ROLE?.trim().toLowerCase();

  if (configuredRole && VALID_DEV_ROLES.has(configuredRole as Role)) {
    return configuredRole as Role;
  }

  return "viewer";
}

/**
 * Load the current user.
 *
 * A development identity is permitted only when both conditions are true:
 *
 * 1. NODE_ENV is exactly "development"
 * 2. ALLOW_DEV_IDENTITY is exactly "true"
 *
 * Azure App Service normally runs with NODE_ENV=production, so accidentally
 * adding ALLOW_DEV_IDENTITY=true to Azure will still not enable this fallback.
 */
export async function requireCurrentUser(): Promise<EntraIdentity> {
  if (developmentIdentityEnabled()) {
    const role = readDevelopmentRole();

    return {
      oid: process.env.DEV_IDENTITY_OID?.trim() || "local-development-user",
      email: process.env.DEV_IDENTITY_EMAIL?.trim() || "developer@localhost",
      displayName: process.env.DEV_IDENTITY_NAME?.trim() || "Local Developer",
      authenticationType: "development",
      appRoles: [
        role === "admin" ? "Admin" : role === "manager" ? "Manager" : "Viewer",
      ],
      role,
    };
  }

  return requireEntraIdentity();
}
