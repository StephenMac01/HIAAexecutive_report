import { NextResponse, type NextRequest } from "next/server";

import {
  verifyEntraToken,
  isTokenVerificationConfigured,
  EntraAuthorizationError,
} from "@/lib/auth/token";

import { createSession, clearSession } from "@/lib/auth/session";

/**
 * Session bridge for browser-only MSAL authentication.
 *
 * POST:
 *   Browser sends an Entra access token in:
 *   Authorization: Bearer <token>
 *
 *   The server verifies the token against Microsoft's JWKS,
 *   extracts the identity and roles, and creates our own
 *   httpOnly hiaa_session cookie.
 *
 * DELETE:
 *   Clears the local application session cookie.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i);

  return match?.[1]?.trim() || null;
}

/**
 * Exchange a verified Microsoft Entra access token
 * for the application's server-side session.
 */
export async function POST(request: NextRequest) {
  if (!isTokenVerificationConfigured()) {
    console.error("[auth] Server-side Entra verification is not configured.");

    return NextResponse.json(
      {
        error: "Authentication is not configured on the server.",
      },
      {
        status: 503,
      },
    );
  }

  const rawToken = getBearerToken(request);

  if (!rawToken) {
    return NextResponse.json(
      {
        error: "Missing bearer token.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    /**
     * This performs:
     *
     * - JWT signature verification
     * - issuer validation
     * - audience validation
     * - expiration validation
     * - extraction of oid/email/name/roles
     */
    const identity = await verifyEntraToken(rawToken);

    /**
     * Convert the verified Entra identity into our own
     * signed, httpOnly session cookie.
     */
    await createSession({
      id: identity.oid,
      email: identity.email,
      displayName: identity.displayName,
      role: identity.role,
      appRoles: identity.appRoles,
    });

    return NextResponse.json(
      {
        ok: true,

        user: {
          id: identity.oid,
          email: identity.email,
          displayName: identity.displayName,
          role: identity.role,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    if (error instanceof EntraAuthorizationError) {
      console.warn("[auth] Entra authorization denied:", error.message);

      return NextResponse.json(
        {
          error:
            "Your Microsoft account is authenticated, but it is not authorized to access the CNS HIAA KPI Dashboard.",
        },
        {
          status: 403,
        },
      );
    }

    console.error(
      "[auth] Entra token verification failed:",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json(
      {
        error: "Invalid or expired Microsoft authentication token.",
      },
      {
        status: 401,
      },
    );
  }
}

/**
 * Clear the local application session.
 *
 * MSAL logout itself is performed by the browser afterward.
 */
export async function DELETE() {
  try {
    await clearSession();

    return NextResponse.json(
      {
        ok: true,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("[auth] Session deletion failed:", error);

    return NextResponse.json(
      {
        error: "Unable to clear the application session.",
      },
      {
        status: 500,
      },
    );
  }
}
