import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { KPIS, getKpi } from "@/lib/kpi-registry";
import { kpiCacheTag } from "@/lib/sharepoint/workbook-source";

export const dynamic = "force-dynamic";

/**
 * On-demand refresh webhook for an internally-hosted Next.js server.
 *
 * This route has NO Vercel dependency — `revalidateTag` is a standard Next.js
 * API that works identically on a self-hosted Node.js server, a Windows
 * service, or a Docker container. Point a Power Automate "When a file is
 * modified" flow at it (directly, or through the Microsoft On-premises Data
 * Gateway) to refresh a KPI the moment its SharePoint workbook changes.
 *
 * Auth (either works):
 *   - Header:  x-revalidate-secret: <REVALIDATE_SECRET>
 *   - Query:   ?secret=<REVALIDATE_SECRET>
 *
 * Body (JSON, all optional — refreshes everything when empty):
 *   { "kpiId": "kpi-01" }                      explicit id
 *   { "fileName": "kpi-01.xlsx" }              derived from the modified file
 *   { "filePath": "/HIAA-KPIs/kpi-01/kpi-01.xlsx" }  derived from a full path
 *
 * Success: { "revalidated": ["kpi-01"] }
 */

/** Extract a "kpi-NN" id from a filename or path, or null if none is present. */
function deriveKpiId(
  ...candidates: (string | undefined | null)[]
): string | null {
  for (const raw of candidates) {
    if (!raw) continue;
    const match = String(raw).match(/kpi[-_]?(\d{1,2})/i);
    if (match) {
      const id = `kpi-${match[1].padStart(2, "0")}`;
      if (getKpi(id)) return id;
    }
  }
  return null;
}

function authorize(
  request: Request,
): { ok: true } | { ok: false; response: NextResponse } {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Webhook not configured: set REVALIDATE_SECRET on the server.",
        },
        { status: 503 },
      ),
    };
  }

  const provided =
    request.headers.get("x-revalidate-secret") ??
    new URL(request.url).searchParams.get("secret");
  if (provided !== secret) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true };
}

export async function POST(request: Request) {
  const auth = authorize(request);
  if (!auth.ok) return auth.response;

  // Body is optional; tolerate an empty/invalid body (refresh everything).
  const body = (await request.json().catch(() => ({}))) as {
    kpiId?: string;
    fileName?: string;
    filePath?: string;
    filename?: string;
  };

  // Allow the id to arrive as an explicit field, a query param, or be derived
  // from the name/path of the file that triggered the flow.
  const url = new URL(request.url);
  const explicitId = body.kpiId ?? url.searchParams.get("kpiId") ?? undefined;
  const derivedId =
    explicitId ??
    deriveKpiId(
      body.fileName,
      body.filename,
      body.filePath,
      url.searchParams.get("fileName"),
    );

  if (derivedId) {
    if (!getKpi(derivedId)) {
      return NextResponse.json(
        { error: `Unknown KPI: ${derivedId}` },
        { status: 404 },
      );
    }
    revalidateTag(kpiCacheTag(derivedId), { expire: 0 });
    revalidatePath(`/kpi/${derivedId}`);

    return NextResponse.json({
      revalidated: [derivedId],
      path: `/kpi/${derivedId}`,
      timestamp: new Date().toISOString(),
    });
  }

  // No id resolved → refresh the whole portfolio.
  for (const kpi of KPIS) {
    revalidateTag(kpiCacheTag(kpi.id), { expire: 0 });
    revalidatePath(`/kpi/${kpi.id}`);
  }
  return NextResponse.json({ revalidated: KPIS.map((k) => k.id) });
}

/**
 * Health check for verifying the endpoint is reachable (e.g. through the
 * on-premises gateway or a reverse proxy) without triggering a refresh.
 * Returns whether the secret is configured, but never reveals its value.
 */
export async function GET(request: Request) {
  const configured = Boolean(process.env.REVALIDATE_SECRET);
  const authenticated = authorize(request).ok;
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/revalidate",
    method: "POST",
    secretConfigured: configured,
    authenticated,
    kpis: KPIS.length,
  });
}
