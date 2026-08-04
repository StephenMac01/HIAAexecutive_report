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
 * Diagnostic information reports only whether values exist and their lengths.
 * It never logs or returns either secret.
 */
function authorize(request: Request): AuthorizationResult {
  const configuredSecret = process.env.REVALIDATE_SECRET?.trim();

  const headerSecret = request.headers.get("x-revalidate-secret")?.trim();

  const querySecret = new URL(request.url).searchParams.get("secret")?.trim();

  const suppliedSecret = headerSecret ?? querySecret;

  const diagnostic = {
    configuredSecretPresent: Boolean(configuredSecret),
    suppliedSecretPresent: Boolean(suppliedSecret),
    configuredSecretLength: configuredSecret?.length ?? 0,
    suppliedSecretLength: suppliedSecret?.length ?? 0,
    source: headerSecret
      ? "x-revalidate-secret header"
      : querySecret
        ? "secret query parameter"
        : "none",
  };

  console.log("Revalidate authorization check", diagnostic);

  if (!configuredSecret) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Webhook is not configured.",
          diagnostic: {
            configuredSecretPresent: false,
            suppliedSecretPresent: Boolean(suppliedSecret),
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
            configuredSecretPresent: Boolean(configuredSecret),
            suppliedSecretPresent: Boolean(suppliedSecret),
            configuredSecretLength: configuredSecret.length,
            suppliedSecretLength: suppliedSecret?.length ?? 0,
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

  const body = (await request.json().catch(() => ({}))) as {
    kpiId?: string;
    fileName?: string;
    filename?: string;
    filePath?: string;
  };

  const url = new URL(request.url);

  const explicitId = body.kpiId ?? url.searchParams.get("kpiId") ?? undefined;

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
 * It confirms whether the route is reachable and whether authentication
 * succeeds, without exposing the secret value.
 */
export async function GET(request: Request) {
  const authorization = authorize(request);

  return NextResponse.json(
    {
      status: "ok",
      endpoint: "/api/revalidate",
      postRequiredForRevalidation: true,
      secretConfigured: Boolean(process.env.REVALIDATE_SECRET?.trim()),
      authenticated: authorization.ok,
      kpis: KPIS.length,
      timestamp: new Date().toISOString(),
    },
    {
      status: authorization.ok ? 200 : 401,
    },
  );
}
