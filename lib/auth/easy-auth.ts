import "server-only";

import { headers } from "next/headers";
import type { Role } from "@/lib/notifications/types";

/**
 * Azure App Service Authentication ("Easy Auth") integration.
 *
 * Easy Auth validates the Microsoft Entra ID session before the request reaches
 * this application. Azure App Service then injects the authenticated principal
 * into request headers.
 *
 * Primary header:
 *   x-ms-client-principal
 *
 * Convenience headers:
 *   x-ms-client-principal-id
 *   x-ms-client-principal-name
 *
 * Expected Entra App Role values:
 *   Admin
 *   Manager
 *   Viewer
 */

/**
 * Keep these values synchronized with the App Role "Value" fields configured
 * in the Microsoft Entra app registration.
 */
const ENTRA_APP_ROLE_VALUES = {
  admin: "admin",
  manager: "manager",
  viewer: "viewer",
} as const;

const ROLE_RANK: Record<Role, number> = {
  viewer: 1,
  manager: 2,
  admin: 3,
};

/** A single claim serialized into X-MS-CLIENT-PRINCIPAL. */
type EasyAuthClaim = {
  typ: string;
  val: string;
};

/** Decoded X-MS-CLIENT-PRINCIPAL structure. */
type EasyAuthPrincipal = {
  auth_typ?: unknown;
  name_typ?: unknown;
  role_typ?: unknown;
  claims?: unknown;
};

/**
 * An authenticated and authorized application user.
 *
 * A user receives this type only after a recognized Admin, Manager, or Viewer
 * App Role has been found.
 */
export type EntraIdentity = {
  /** Stable Microsoft Entra object identifier. */
  oid: string;
  email: string;
  displayName: string;

  /** Authentication provider reported by Easy Auth, normally "aad". */
  authenticationType: string;

  /** Raw App Role values returned by Easy Auth. */
  appRoles: string[];

  /** Highest recognized internal role. */
  role: Role;
};

/**
 * Parsed identity before authorization is enforced.
 *
 * role is null when the person signed in successfully but Entra did not issue
 * a recognized application role.
 */
export type ParsedEntraIdentity = Omit<EntraIdentity, "role"> & {
  role: Role | null;
};

export type AuthErrorCode =
  | "AUTHENTICATION_REQUIRED"
  | "AUTHENTICATION_CONFIGURATION_ERROR"
  | "AUTHORIZATION_REQUIRED"
  | "INSUFFICIENT_ROLE";

export class AuthError extends Error {
  readonly code: AuthErrorCode;
  readonly status: 401 | 403 | 500;

  constructor(code: AuthErrorCode, message: string, status: 401 | 403 | 500) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.status = status;
  }
}

/**
 * Claim types used by Microsoft Entra ID and Easy Auth.
 *
 * The long URI forms are common after claims mapping. Short forms can also be
 * present depending on the App Service and app-registration configuration.
 */
const OID_CLAIMS = [
  "http://schemas.microsoft.com/identity/claims/objectidentifier",
  "oid",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
] as const;

const EMAIL_CLAIMS = [
  "preferred_username",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  "email",
  "emails",
  "upn",
  "unique_name",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn",
] as const;

const NAME_CLAIMS = [
  "name",
  "given_name",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
] as const;

const DEFAULT_ROLE_CLAIMS = [
  "roles",
  "role",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
] as const;

function normalizeText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeClaimType(value: string): string {
  return value.trim().toLowerCase();
}

function isEasyAuthClaim(value: unknown): value is EasyAuthClaim {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Partial<EasyAuthClaim>;

  return (
    typeof candidate.typ === "string" &&
    candidate.typ.trim().length > 0 &&
    typeof candidate.val === "string" &&
    candidate.val.trim().length > 0
  );
}

function extractClaims(principal: EasyAuthPrincipal): EasyAuthClaim[] {
  if (!Array.isArray(principal.claims)) return [];

  return principal.claims.filter(isEasyAuthClaim).map((claim) => ({
    typ: claim.typ.trim(),
    val: claim.val.trim(),
  }));
}

function firstClaim(
  claims: EasyAuthClaim[],
  claimTypes: readonly string[],
): string | undefined {
  const acceptedTypes = new Set(
    claimTypes.map((type) => normalizeClaimType(type)),
  );

  for (const claim of claims) {
    if (acceptedTypes.has(normalizeClaimType(claim.typ))) {
      return claim.val;
    }
  }

  return undefined;
}

function allClaims(
  claims: EasyAuthClaim[],
  claimTypes: readonly string[],
): string[] {
  const acceptedTypes = new Set(
    claimTypes.map((type) => normalizeClaimType(type)),
  );

  const values = claims
    .filter((claim) => acceptedTypes.has(normalizeClaimType(claim.typ)))
    .map((claim) => claim.val.trim())
    .filter(Boolean);

  return [...new Set(values)];
}

/**
 * Map exact Entra App Role values to the internal application role.
 *
 * Matching is:
 * - case-insensitive
 * - whitespace-tolerant
 * - exact
 *
 * Deliberately not accepted:
 * - "SuperAdmin"
 * - "KPI.Admin"
 * - "Administrator"
 *
 * The values configured in Entra should be exactly:
 * - Admin
 * - Manager
 * - Viewer
 */
export function mapAppRolesToRole(appRoles: readonly string[]): Role | null {
  const normalized = new Set(
    appRoles.map((role) => role.trim().toLowerCase()).filter(Boolean),
  );

  if (normalized.has(ENTRA_APP_ROLE_VALUES.admin)) {
    return "admin";
  }

  if (normalized.has(ENTRA_APP_ROLE_VALUES.manager)) {
    return "manager";
  }

  if (normalized.has(ENTRA_APP_ROLE_VALUES.viewer)) {
    return "viewer";
  }

  return null;
}

/**
 * Decode and parse X-MS-CLIENT-PRINCIPAL.
 *
 * Returns null for:
 * - a missing header
 * - invalid Base64
 * - invalid JSON
 * - missing claims
 * - missing stable Entra object identifier
 */
export function parsePrincipalHeader(
  headerValue: string | null | undefined,
): ParsedEntraIdentity | null {
  const encodedPrincipal = normalizeText(headerValue);
  if (!encodedPrincipal) return null;

  let decodedValue: string;

  try {
    decodedValue = Buffer.from(encodedPrincipal, "base64").toString("utf8");
  } catch {
    return null;
  }

  let principal: EasyAuthPrincipal;

  try {
    const parsed: unknown = JSON.parse(decodedValue);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return null;
    }

    principal = parsed as EasyAuthPrincipal;
  } catch {
    return null;
  }

  const claims = extractClaims(principal);
  if (claims.length === 0) return null;

  const oid = firstClaim(claims, OID_CLAIMS);
  if (!oid) {
    // Never authorize an identity without a stable Entra object ID.
    return null;
  }

  const email = firstClaim(claims, EMAIL_CLAIMS) ?? "";

  const displayName =
    firstClaim(claims, NAME_CLAIMS) ?? email ?? "Unknown user";

  /**
   * Easy Auth can declare the claim type used for roles through role_typ.
   * Include that value in addition to the standard role claim names.
   */
  const declaredRoleType = normalizeText(principal.role_typ);

  const roleClaimTypes = declaredRoleType
    ? [...DEFAULT_ROLE_CLAIMS, declaredRoleType]
    : [...DEFAULT_ROLE_CLAIMS];

  const appRoles = allClaims(claims, roleClaimTypes);

  return {
    oid,
    email,
    displayName,
    authenticationType: normalizeText(principal.auth_typ) ?? "aad",
    appRoles,
    role: mapAppRolesToRole(appRoles),
  };
}

/**
 * Read the current Easy Auth identity.
 *
 * Important:
 * This function does not create a development identity. In production, a
 * missing principal is always treated as an authentication/configuration
 * failure.
 *
 * The convenience headers are insufficient for role authorization because
 * they do not contain App Role claims. They are used only to help distinguish
 * an incomplete Easy Auth configuration from a completely unauthenticated
 * request.
 */
export async function readEntraIdentity(): Promise<ParsedEntraIdentity | null> {
  const requestHeaders = await headers();

  return parsePrincipalHeader(requestHeaders.get("x-ms-client-principal"));
}

/**
 * Return the authenticated and authorized identity.
 *
 * Throws:
 * - 401 when there is no authenticated Easy Auth principal
 * - 500 when Azure provides convenience identity headers but omits the full
 *   claims principal required for authorization
 * - 403 when the user signed in but has no recognized App Role
 */
export async function requireEntraIdentity(): Promise<EntraIdentity> {
  const requestHeaders = await headers();

  const principalHeader = requestHeaders.get("x-ms-client-principal");

  const identity = parsePrincipalHeader(principalHeader);

  if (!identity) {
    const convenienceOid = normalizeText(
      requestHeaders.get("x-ms-client-principal-id"),
    );

    if (convenienceOid) {
      throw new AuthError(
        "AUTHENTICATION_CONFIGURATION_ERROR",
        [
          "Microsoft Entra ID identified the user, but App Service did not",
          "provide a valid x-ms-client-principal header. Verify the App",
          "Service Authentication configuration.",
        ].join(" "),
        500,
      );
    }

    throw new AuthError(
      "AUTHENTICATION_REQUIRED",
      "Microsoft Entra ID authentication is required.",
      401,
    );
  }

  if (!identity.role) {
    throw new AuthError(
      "AUTHORIZATION_REQUIRED",
      [
        "You are signed in, but no recognized HIAA KPI application role was",
        "included in your Microsoft Entra ID identity. An administrator must",
        "assign you to the Admin, Manager, or Viewer app role.",
      ].join(" "),
      403,
    );
  }

  return {
    ...identity,
    role: identity.role,
  };
}

/**
 * Return true when actualRole has at least the requested privilege.
 *
 * Hierarchy:
 * admin > manager > viewer
 */
export function hasRequiredRole(actualRole: Role, requiredRole: Role): boolean {
  return ROLE_RANK[actualRole] >= ROLE_RANK[requiredRole];
}

/**
 * Require a minimum application role.
 *
 * Examples:
 *
 *   await requireRole("viewer")
 *   await requireRole("manager")
 *   await requireRole("admin")
 */
export async function requireRole(requiredRole: Role): Promise<EntraIdentity> {
  const identity = await requireEntraIdentity();

  if (!hasRequiredRole(identity.role, requiredRole)) {
    throw new AuthError(
      "INSUFFICIENT_ROLE",
      `${requiredRole} access or higher is required.`,
      403,
    );
  }

  return identity;
}

/**
 * Convert authentication errors into a safe client-facing object.
 *
 * Unexpected internal errors are intentionally hidden.
 */
export function getPublicAuthError(error: unknown): {
  status: number;
  body: {
    error: string;
    code: string;
  };
} {
  if (error instanceof AuthError) {
    return {
      status: error.status,
      body: {
        error: error.message,
        code: error.code,
      },
    };
  }

  console.error("Unexpected authorization error:", error);

  return {
    status: 500,
    body: {
      error: "An unexpected authorization error occurred.",
      code: "INTERNAL_AUTHORIZATION_ERROR",
    },
  };
}
