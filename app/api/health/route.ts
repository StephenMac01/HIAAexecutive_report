import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { KPIS, getKpi } from "@/lib/kpi-registry";
import { isSharePointConfigured } from "@/lib/sharepoint/graph-client";
import {
  diagnoseKpiSource,
  kpiCacheTag,
} from "@/lib/sharepoint/workbook-source";

export const dynamic = "force-dynamic";

/**
 * Operational health + readiness endpoint.
 *
 * GET /api/health
 *   Lightweight liveness/readiness check.
 *
 * GET /api/health?deep=1
 *   Runs one live SharePoint download and workbook parse for kpi-01.
 *
 * GET /api/health?identity=1
 *   Reports whether Azure App Service Easy Auth identity headers are present
 *   and which claim types were supplied.
 *
 * GET /api/health?deep=1&identity=1
 *   Runs both protected diagnostics.
 *
 * Protected diagnostics require REVALIDATE_SECRET through either:
 *
 *   x-revalidate-secret: <secret>
 *
 * or:
 *
 *   ?secret=<secret>
 *
 * This endpoint never returns passwords, tokens, connection strings,
 * identity values, workbook contents, or claim values.
 */

type Check = {
  name: string;
  ok: boolean;
  detail: string;
};

type EasyAuthDiagnostic = {
  principalHeaderPresent: boolean;
  principalIdPresent: boolean;
  principalNamePresent: boolean;
  identityProvider: string | null;
  principalDecoded: boolean;
  claimTypes: string[];
};

function envPresence() {
  // Report presence only—never return values.
  const required = [
    "SHAREPOINT_TENANT_ID",
    "SHAREPOINT_CLIENT_ID",
    "SHAREPOINT_CLIENT_SECRET",
    "SHAREPOINT_SITE_URL",
  ];

  const optional = [
    "SHAREPOINT_BASE_PATH",
    "SHAREPOINT_FILE_TEMPLATE",
    "KPI_CACHE_TTL_SECONDS",
    "REVALIDATE_SECRET",
    "DATABASE_URL",
  ];

  const present = (key: string) => Boolean(process.env[key]?.trim());

  return {
    required: Object.fromEntries(required.map((key) => [key, present(key)])),
    optional: Object.fromEntries(optional.map((key) => [key, present(key)])),
    allRequiredPresent: required.every(present),
  };
}

function isAuthorized(request: Request): boolean {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    return false;
  }

  const requestUrl = new URL(request.url);

  const provided =
    request.headers.get("x-revalidate-secret") ??
    requestUrl.searchParams.get("secret");

  return provided === secret;
}

/**
 * Safely inspect Easy Auth headers.
 *
 * This returns only:
 * - whether headers exist;
 * - whether the principal can be decoded;
 * - claim type names.
 *
 * It does not return claim values, user IDs, names, email addresses, or tokens.
 */
async function diagnoseEasyAuth(): Promise<EasyAuthDiagnostic> {
  const requestHeaders = await headers();

  const principalHeader = requestHeaders.get("x-ms-client-principal");

  const principalIdPresent = Boolean(
    requestHeaders.get("x-ms-client-principal-id"),
  );

  const principalNamePresent = Boolean(
    requestHeaders.get("x-ms-client-principal-name"),
  );

  const identityProvider = requestHeaders.get("x-ms-client-principal-idp");

  let principalDecoded = false;
  let claimTypes: string[] = [];

  if (principalHeader) {
    try {
      const decoded = JSON.parse(
        Buffer.from(principalHeader, "base64").toString("utf8"),
      ) as {
        claims?: Array<{
          typ?: string;
          val?: string;
        }>;
      };

      principalDecoded = true;

      claimTypes = Array.from(
        new Set(
          (decoded.claims ?? [])
            .map((claim) => claim.typ)
            .filter((type): type is string => Boolean(type)),
        ),
      ).sort();
    } catch {
      principalDecoded = false;
    }
  }

  return {
    principalHeaderPresent: Boolean(principalHeader),
    principalIdPresent,
    principalNamePresent,
    identityProvider: identityProvider ?? null,
    principalDecoded,
    claimTypes,
  };
}

export async function GET(request: Request) {
  const checks: Check[] = [];
  const requestUrl = new URL(request.url);

  const deepRequested = requestUrl.searchParams.get("deep") === "1";

  const identityRequested = requestUrl.searchParams.get("identity") === "1";

  checks.push({
    name: "process",
    ok: true,
    detail: "application is running",
  });

  // Registry must cover KPI-01 through KPI-21.
  const missing = Array.from(
    { length: 21 },
    (_, index) => `kpi-${String(index + 1).padStart(2, "0")}`,
  ).filter((id) => !getKpi(id));

  checks.push({
    name: "kpi-mappings",
    ok: missing.length === 0 && KPIS.length === 21,
    detail:
      missing.length === 0
        ? "all 21 KPI mappings present"
        : `missing: ${missing.join(", ")}`,
  });

  // Cache layer should accept a tag revalidation call.
  let cacheOk = true;

  try {
    revalidateTag(kpiCacheTag("kpi-01"), "max");
  } catch {
    cacheOk = false;
  }

  checks.push({
    name: "cache",
    ok: cacheOk,
    detail: cacheOk ? "revalidation API operational" : "revalidateTag failed",
  });

  const env = envPresence();

  checks.push({
    name: "sharepoint-config",
    // SharePoint remains optional because local fallback files exist.
    ok: true,
    detail: isSharePointConfigured()
      ? "configured"
      : "not configured (serving local fallback workbooks)",
  });

  /*
   * Any live or identity diagnostic is protected.
   */
  if ((deepRequested || identityRequested) && !isAuthorized(request)) {
    return NextResponse.json(
      {
        error:
          "Unauthorized: protected health diagnostics require REVALIDATE_SECRET",
      },
      { status: 401 },
    );
  }

  let readiness: Record<string, unknown> | undefined;

  let identity: EasyAuthDiagnostic | undefined;

  /*
   * Easy Auth diagnostic.
   */
  if (identityRequested) {
    identity = await diagnoseEasyAuth();

    const identityOk =
      identity.principalHeaderPresent || identity.principalIdPresent;

    checks.push({
      name: "entra-identity",
      ok: identityOk,
      detail: identityOk
        ? "Easy Auth identity headers are present"
        : "Easy Auth identity headers are missing",
    });
  }

  /*
   * Deep SharePoint diagnostic.
   */
  if (deepRequested) {
    if (!isSharePointConfigured()) {
      readiness = {
        skipped: true,
        reason: "SharePoint not configured",
      };
    } else {
      // Probe only KPI-01, not all 21 workbooks.
      const diagnostic = await diagnoseKpiSource("kpi-01");

      readiness = {
        overallOk: diagnostic.overallOk,
        parseOk: diagnostic.parse.ok,
        stages: diagnostic.stages.map((stage) => ({
          stage: stage.stage,
          ok: stage.ok,
          ms: stage.ms,
        })),
      };

      checks.push({
        name: "sharepoint-readiness",
        ok: diagnostic.overallOk && diagnostic.parse.ok,
        detail:
          diagnostic.overallOk && diagnostic.parse.ok
            ? "live download and parse succeeded for kpi-01"
            : "live SharePoint probe failed",
      });
    }
  }

  const ok = checks.every((check) => check.ok);

  return NextResponse.json(
    {
      status: ok ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
      env,
      ...(identity ? { identity } : {}),
      ...(readiness ? { readiness } : {}),
    },
    {
      status: ok ? 200 : 503,
    },
  );
}
