import "server-only";

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import type { Role } from "@/lib/notifications/types";
import { mapAppRolesToRole } from "./roles";

const TENANT_ID =
  process.env.AZURE_TENANT_ID || process.env.NEXT_PUBLIC_AZURE_TENANT_ID || "";

const CLIENT_ID =
  process.env.AZURE_CLIENT_ID || process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || "";

const EXPECTED_AUDIENCES = [
  process.env.AZURE_API_AUDIENCE,
  CLIENT_ID ? `api://${CLIENT_ID}` : undefined,
  CLIENT_ID || undefined,
].filter(Boolean) as string[];

const VALID_ISSUERS = TENANT_ID
  ? [
      `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
      `https://sts.windows.net/${TENANT_ID}/`,
    ]
  : [];

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL("https://login.microsoftonline.com/common/discovery/v2.0/keys"),
    );
  }

  return jwks;
}

export class EntraAuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EntraAuthorizationError";
  }
}

export type VerifiedIdentity = {
  oid: string;
  email: string;
  displayName: string;
  appRoles: string[];
  role: Role;
};

type EntraClaims = JWTPayload & {
  oid?: string;
  preferred_username?: string;
  upn?: string;
  email?: string;
  name?: string;
  roles?: string[];
};

export function isTokenVerificationConfigured(): boolean {
  return Boolean(TENANT_ID && CLIENT_ID);
}

export async function verifyEntraToken(
  rawToken: string,
): Promise<VerifiedIdentity> {
  if (!isTokenVerificationConfigured()) {
    throw new Error(
      "Entra token verification is not configured (AZURE_TENANT_ID / AZURE_CLIENT_ID).",
    );
  }

  if (!rawToken) {
    throw new Error("Missing access token.");
  }

  const { payload } = await jwtVerify(rawToken, getJwks(), {
    issuer: VALID_ISSUERS,
    audience: EXPECTED_AUDIENCES,
    algorithms: ["RS256"],
  });

  const claims = payload as EntraClaims;

  const oid =
    claims.oid ?? (typeof claims.sub === "string" ? claims.sub : undefined);

  if (!oid) {
    throw new Error("Token has no stable subject/oid claim.");
  }

  const email = claims.preferred_username || claims.upn || claims.email || "";

  const displayName = claims.name || email || "Unknown user";

  const appRoles = Array.isArray(claims.roles)
    ? claims.roles.filter((role): role is string => typeof role === "string")
    : [];

  const role = mapAppRolesToRole(appRoles);

  if (!role) {
    console.warn("[auth] User authenticated without recognized app role", {
      oid,
      email,
      appRoles,
    });

    throw new EntraAuthorizationError(
      "Your account is authenticated but does not have an authorized CNS HIAA application role.",
    );
  }

  return {
    oid,
    email,
    displayName,
    appRoles,
    role,
  };
}
