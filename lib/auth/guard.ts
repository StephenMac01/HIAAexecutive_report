import "server-only";

import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/notifications/identity";

import type { CurrentUser, Role } from "@/lib/notifications/types";

/**
 * Privilege order used by API authorization.
 *
 * viewer  < manager < admin
 */
const ROLE_RANK: Record<Role, number> = {
  viewer: 1,
  manager: 2,
  admin: 3,
};

/**
 * Result returned by authentication guards.
 */
export type AuthGuardResult =
  | {
      ok: true;
      user: CurrentUser;
    }
  | {
      ok: false;
      status: 401 | 403;
      error: string;
      response: NextResponse;
    };

/**
 * Require a valid Microsoft Entra authenticated user.
 *
 * Production behavior:
 *
 * no session
 *   -> 401
 *
 * valid Viewer
 *   -> authenticated
 *
 * valid Manager
 *   -> authenticated
 *
 * valid Administrator
 *   -> authenticated
 *
 * There is NO Guest / anonymous fallback.
 */
export async function requireAuthenticatedUser(): Promise<AuthGuardResult> {
  const user = await getCurrentUser();

  if (!user) {
    const error = "Authentication required.";

    return {
      ok: false,
      status: 401,
      error,
      response: NextResponse.json(
        {
          error,
        },
        {
          status: 401,
        },
      ),
    };
  }

  return {
    ok: true,
    user,
  };
}

/**
 * Require an authenticated user with at least the requested role.
 *
 * Examples:
 *
 * requireApiRole("viewer")
 *   Viewer        -> allowed
 *   Manager       -> allowed
 *   Administrator -> allowed
 *
 * requireApiRole("manager")
 *   Viewer        -> 403
 *   Manager       -> allowed
 *   Administrator -> allowed
 *
 * requireApiRole("admin")
 *   Viewer        -> 403
 *   Manager       -> 403
 *   Administrator -> allowed
 */
export async function requireApiRole(
  requiredRole: Role,
): Promise<AuthGuardResult> {
  const auth = await requireAuthenticatedUser();

  if (!auth.ok) {
    return auth;
  }

  const user = auth.user;

  if (ROLE_RANK[user.role] < ROLE_RANK[requiredRole]) {
    const error = `This operation requires the ${requiredRole} role or higher.`;

    return {
      ok: false,
      status: 403,
      error,
      response: NextResponse.json(
        {
          error,
        },
        {
          status: 403,
        },
      ),
    };
  }

  return {
    ok: true,
    user,
  };
}
