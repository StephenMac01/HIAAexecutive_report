import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { KPIS, getKpi } from "@/lib/kpi-registry";
import { kpiCacheTag } from "@/lib/sharepoint/workbook-source";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AuthorizationResult =
  | { ok: true }
  | {
      ok: false;
      response: NextResponse;
    };

type RevalidateRequestBody = {
  kpiId?: string;
  fileName?: string;
  filename?: string;
  filePath?: string;
};

/**
 * Extracts a KPI identifier such as "kpi-01" from a file name or path.
 */
function deriveKpiId(
  ...candidates: Array<string | undefined | null>
): string | null {
  for (const raw of candidates) {
    if (!raw) {
      continue;
    }

    const match = String(raw).match(/kpi[-_]?(\d{1,2})/i);

    if (!match) {
      continue;
    }

    const id = `kpi-${match[1].padStart(2, "0")}`;

    if (getKpi(id)) {
      return id;
    }
  }

  return null;
}

/**
 * Validates the webhook secret.
 *
 * Accepted methods:
 * - Header: x-revalidate-secret
 * - Query string: ?secret=
 *
 * Only presence, source, and length are logged.
 * Secret values are never logged or returned.
 */
function authorize(request: Request): AuthorizationResult {
  const configuredSecret = process.env.REVALIDATE_SECRET?.trim() ?? "";

  const headerSecret = request.headers.get("x-revalidate-secret")?.trim() ?? "";

  const querySecret =
    new URL(request.url).searchParams.get("secret")?.trim() ?? "";

  const suppliedSecret = headerSecret || querySecret;

  const source = headerSecret
    ? "x-revalidate-secret header"
    : querySecret
      ? "secret query parameter"
      : "none";

  const diagnostic = {
    configuredSecretPresent: configuredSecret.length > 0,
    suppliedSecretPresent: suppliedSecret.length > 0,
    configuredSecretLength: configuredSecret.length,
    suppliedSecretLength: suppliedSecret.length,
    source,
    match:
      configuredSecret.length > 0 &&
      suppliedSecret.length > 0 &&
      suppliedSecret === configuredSecret,
  };

  console.log("[revalidate] authorization check", diagnostic);

  if (!configuredSecret) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Webhook is not configured.",
          diagnostic: {
            configuredSecretPresent: false,
            suppliedSecretPresent: suppliedSecret.length > 0,
            configuredSecretLength: 0,
            suppliedSecretLength: suppliedSecret.length,
            source,
          },
        },
        { status: 503 },
      ),
    };
  }

  if (!suppliedSecret || suppliedSecret !== configuredSecret) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Unauthorized",
          diagnostic: {
            configuredSecretPresent: true,
            suppliedSecretPresent: suppliedSecret.length > 0,
            configuredSecretLength: configuredSecret.length,
            suppliedSecretLength: suppliedSecret.length,
            source,
          },
        },
        { status: 401 },
      ),
    };
  }

  return { ok: true };
}

/**
 * Power Automate webhook.
 *
 * Supported request body examples:
 *
 * { "kpiId": "kpi-01" }
 * { "fileName": "kpi-01.xlsx" }
 * { "filePath": "/HIAA-KPIs/kpi-01/kpi-01.xlsx" }
 *
 * An empty body refreshes all KPIs.
 */
export async function POST(request: Request) {
  const authorization = authorize(request);

  if (!authorization.ok) {
    return authorization.response;
  }

  const body = (await request
    .json()
    .catch(() => ({}))) as RevalidateRequestBody;

  const url = new URL(request.url);

  const explicitId =
    body.kpiId?.trim() || url.searchParams.get("kpiId")?.trim() || undefined;

  const resolvedId =
    explicitId ??
    deriveKpiId(
      body.fileName,
      body.filename,
      body.filePath,
      url.searchParams.get("fileName"),
      url.searchParams.get("filePath"),
    );

  if (resolvedId) {
    if (!getKpi(resolvedId)) {
      return NextResponse.json(
        {
          error: `Unknown KPI: ${resolvedId}`,
        },
        { status: 404 },
      );
    }

    revalidateTag(kpiCacheTag(resolvedId), "max");

    return NextResponse.json({
      status: "success",
      revalidated: [resolvedId],
      timestamp: new Date().toISOString(),
    });
  }

  for (const kpi of KPIS) {
    revalidateTag(kpiCacheTag(kpi.id), "max");
  }

  return NextResponse.json({
    status: "success",
    revalidated: KPIS.map((kpi) => kpi.id),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Diagnostic endpoint.
 *
 * This confirms whether the route is reachable and whether authentication
 * succeeds. It does not perform revalidation.
 */
export async function GET(request: Request) {
  const authorization = authorize(request);

  if (!authorization.ok) {
    return authorization.response;
  }

  return NextResponse.json({
    status: "ok",
    endpoint: "/api/revalidate",
    postRequiredForRevalidation: true,
    secretConfigured: true,
    authenticated: true,
    kpis: KPIS.length,
    timestamp: new Date().toISOString(),
  });
}
