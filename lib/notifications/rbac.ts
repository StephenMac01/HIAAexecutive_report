import "server-only";

import { getCurrentUser } from "./identity";
import type { CurrentUser, Role } from "./types";

export class AuthorizationError extends Error {
  constructor(
    public readonly requiredRole: Role,
    public readonly actualRole?: Role,
  ) {
    super("You are not authorized to perform this action.");
    this.name = "AuthorizationError";
  }
}

/**
 * Internal privilege order.
 */
const ROLE_RANK: Record<Role, number> = {
  viewer: 1,
  manager: 2,
  admin: 3,
};

export function hasRole(current: Role, required: Role): boolean {
  return ROLE_RANK[current] >= ROLE_RANK[required];
}

/**
 * Require a signed-in user with at least the requested role.
 *
 * No session:
 *   -> AuthorizationError
 *
 * Viewer requesting Manager:
 *   -> AuthorizationError
 *
 * Manager requesting Viewer:
 *   -> allowed
 *
 * Administrator:
 *   -> highest privilege
 */
export async function requireRole(required: Role): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthorizationError(required);
  }

  if (!hasRole(user.role, required)) {
    throw new AuthorizationError(required, user.role);
  }

  return user;
}
