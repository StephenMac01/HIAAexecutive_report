import "server-only";

import type { Role } from "@/lib/notifications/types";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
  AuthError,
  hasRequiredRole,
  type EntraIdentity,
} from "@/lib/auth/easy-auth";

export async function requireMinimumRole(
  requiredRole: Role,
): Promise<EntraIdentity> {
  const identity = await requireCurrentUser();

  if (!hasRequiredRole(identity.role, requiredRole)) {
    throw new AuthError(
      "INSUFFICIENT_ROLE",
      `${requiredRole} access or higher is required.`,
      403,
    );
  }

  return identity;
}

export async function requireViewer(): Promise<EntraIdentity> {
  return requireMinimumRole("viewer");
}

export async function requireManager(): Promise<EntraIdentity> {
  return requireMinimumRole("manager");
}

export async function requireAdministrator(): Promise<EntraIdentity> {
  return requireMinimumRole("admin");
}
