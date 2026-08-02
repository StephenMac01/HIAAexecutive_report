import "server-only"

import { headers } from "next/headers"
import type { Role } from "@/lib/notifications/types"

/**
 * Azure App Service Authentication ("Easy Auth") integration.
 *
 * When Easy Auth is enabled on the App Service, the platform validates the
 * Entra ID login BEFORE the request reaches this app and injects the signed-in
 * principal as request headers. We never see secrets or tokens here — only the
 * already-validated identity, so there is nothing to verify cryptographically.
 *
 * Primary header:
 *   x-ms-client-principal        base64(JSON) with all claims (incl. App Roles)
 * Convenience headers (not always present):
 *   x-ms-client-principal-id     the Entra object id (oid)
 *   x-ms-client-principal-name   the UPN / email
 *
 * Docs: https://learn.microsoft.com/azure/app-service/configure-authentication-user-identities
 */

/** A single claim as serialized by Easy Auth. */
type EasyAuthClaim = { typ: string; val: string }

type EasyAuthPrincipal = {
  auth_typ?: string
  name_typ?: string
  role_typ?: string
  claims?: EasyAuthClaim[]
}

/** The identity we extract from a validated Easy Auth principal. */
export type EntraIdentity = {
  /** Entra object id (oid) — the stable, immutable user key. */
  oid: string
  email: string
  displayName: string
  /** Raw App Role values from the `roles` claim (e.g. "Admin", "Viewer"). */
  appRoles: string[]
  /** App Roles mapped to our internal role (highest wins). */
  role: Role
}

// Claim types Entra/Easy Auth may use for each field, in priority order.
const OID_CLAIMS = [
  "http://schemas.microsoft.com/identity/claims/objectidentifier",
  "oid",
]
const EMAIL_CLAIMS = [
  "preferred_username",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  "email",
  "emails",
  "upn",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn",
]
const NAME_CLAIMS = [
  "name",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
]
const ROLE_CLAIMS = [
  "roles",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
]

function firstClaim(claims: EasyAuthClaim[], types: string[]): string | undefined {
  for (const type of types) {
    const hit = claims.find((c) => c.typ === type && c.val)
    if (hit) return hit.val
  }
  return undefined
}

function allClaims(claims: EasyAuthClaim[], types: string[]): string[] {
  const out: string[] = []
  for (const c of claims) {
    if (types.includes(c.typ) && c.val) out.push(c.val)
  }
  return out
}

/**
 * Map Entra App Role values to our internal role. The highest-privilege role
 * present wins. Matching is case-insensitive and tolerant of prefixed values
 * (e.g. "KPI.Admin", "Portfolio.Manager").
 */
export function mapAppRolesToRole(appRoles: string[]): Role {
  const lower = appRoles.map((r) => r.toLowerCase())
  const has = (needle: string) => lower.some((r) => r.includes(needle))
  if (has("admin")) return "admin"
  if (has("manager")) return "manager"
  // Anyone who signed in but has no recognized elevated role is a viewer.
  return "viewer"
}

/** Decode the base64 principal header into structured claims. */
export function parsePrincipalHeader(headerValue: string | null | undefined): EntraIdentity | null {
  if (!headerValue) return null
  let principal: EasyAuthPrincipal
  try {
    const json = Buffer.from(headerValue, "base64").toString("utf8")
    principal = JSON.parse(json) as EasyAuthPrincipal
  } catch {
    return null
  }
  const claims = principal.claims ?? []
  if (claims.length === 0) return null

  const oid = firstClaim(claims, OID_CLAIMS)
  if (!oid) return null // no stable key -> treat as not-authenticated

  const email = firstClaim(claims, EMAIL_CLAIMS) ?? ""
  const displayName = firstClaim(claims, NAME_CLAIMS) ?? email ?? "Unknown user"
  const appRoles = allClaims(claims, ROLE_CLAIMS)

  return {
    oid,
    email,
    displayName,
    appRoles,
    role: mapAppRolesToRole(appRoles),
  }
}

/**
 * Read and parse the Easy Auth principal from the current request headers.
 * Returns null when Easy Auth is not in front of the app (local dev / preview),
 * which lets callers fall back to a dev identity.
 */
export async function readEntraIdentity(): Promise<EntraIdentity | null> {
  const h = await headers()
  const principal = parsePrincipalHeader(h.get("x-ms-client-principal"))
  if (principal) return principal

  // Fallback: some configs only forward the convenience headers.
  const oid = h.get("x-ms-client-principal-id")
  const name = h.get("x-ms-client-principal-name")
  if (oid) {
    return {
      oid,
      email: name ?? "",
      displayName: name ?? "Unknown user",
      appRoles: [],
      role: "viewer",
    }
  }
  return null
}
