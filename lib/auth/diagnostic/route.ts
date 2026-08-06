import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { getPublicAuthError, parsePrincipalHeader } from "@/lib/auth/easy-auth";

/**
 * TEMPORARY AUTHENTICATION DIAGNOSTIC
 *
 * Enable in Azure App Service with:
 *
 *   ENABLE_AUTH_DIAGNOSTIC=true
 *
 * Disable or remove it after role testing is complete.
 *
 * This endpoint does not return:
 * - raw tokens
 * - the encoded principal header
 * - cookies
 * - authorization headers
 * - all raw claims
 */
export async function GET(): Promise<NextResponse> {
  if (process.env.ENABLE_AUTH_DIAGNOSTIC !== "true") {
    return NextResponse.json(
      {
        error: "Authentication diagnostic is disabled.",
        code: "DIAGNOSTIC_DISABLED",
      },
      {
        status: 404,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  try {
    const requestHeaders = await headers();

    const principalHeader = requestHeaders.get("x-ms-client-principal");

    const identity = parsePrincipalHeader(principalHeader);

    const principalIdHeader = requestHeaders.get("x-ms-client-principal-id");

    const principalNameHeader = requestHeaders.get(
      "x-ms-client-principal-name",
    );

    if (!identity) {
      return NextResponse.json(
        {
          authenticated: false,
          authorized: false,
          diagnostics: {
            hasClientPrincipalHeader: Boolean(principalHeader),
            hasPrincipalIdHeader: Boolean(principalIdHeader),
            hasPrincipalNameHeader: Boolean(principalNameHeader),
          },
          message:
            "No valid Easy Auth principal was found. Verify App Service Authentication and sign in again.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        authorized: identity.role !== null,
        identity: {
          oid: identity.oid,
          email: identity.email,
          displayName: identity.displayName,
          authenticationType: identity.authenticationType,
          appRoles: identity.appRoles,
          mappedRole: identity.role,
        },
        diagnostics: {
          hasClientPrincipalHeader: true,
          hasPrincipalIdHeader: Boolean(principalIdHeader),
          hasPrincipalNameHeader: Boolean(principalNameHeader),
        },
        message:
          identity.role !== null
            ? "Microsoft Entra identity and application role were recognized."
            : "Microsoft Entra sign-in succeeded, but no recognized Admin, Manager, or Viewer app role was found.",
      },
      {
        status: identity.role !== null ? 200 : 403,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error: unknown) {
    const publicError = getPublicAuthError(error);

    return NextResponse.json(publicError.body, {
      status: publicError.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}
