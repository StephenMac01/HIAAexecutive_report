import type { Role } from "@/lib/notifications/types";

/**
 * Maps Microsoft Entra ID App Roles to the application's internal roles.
 *
 * Entra App Role values:
 *   Administrator -> admin
 *   Manager       -> manager
 *   Viewer        -> viewer
 *
 * If a user has multiple roles, the highest-privilege role wins.
 * Matching is case-insensitive and ignores surrounding whitespace.
 */
export function mapAppRolesToRole(appRoles: readonly string[]): Role | null {
  const roles = new Set(appRoles.map((role) => role.trim().toLowerCase()));

  if (roles.has("administrator")) {
    return "admin";
  }

  if (roles.has("manager")) {
    return "manager";
  }

  if (roles.has("viewer")) {
    return "viewer";
  }

  // Authenticated user, but no recognized Entra App Role.
  return null;
}
