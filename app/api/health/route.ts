import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { Client } from "pg";
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
 *   Lightweight health check covering:
 *   - application process
 *   - KPI registry
 *   - cache revalidation
 *   - SharePoint configuration
 *
 * GET /api/health?database=1
 *   Adds a live PostgreSQL connection and schema check.
 *
 * GET /api/health?deep=1
 *   Runs a live SharePoint download and parse check for KPI-01.
 *
 * The database and deep checks require the REVALIDATE_SECRET through either:
 *   x-revalidate-secret: <secret>
 *
 * or:
 *   ?secret=<secret>
 *
 * Never returns passwords, tokens, connection strings, or workbook contents.
 */

type Check = {
  name: string;
  ok: boolean;
  detail: string;
};

type DatabaseReadiness = {
  ok: boolean;
  databaseName?: string;
  databaseUser?: string;
  currentSchema?: string;
  searchPath?: string;
  serverAddress?: string;
  serverPort?: number;
  tables?: {
    appUser: boolean;
    delivery: boolean;
    alertEvent: boolean;
  };
  error?: string;
};

function envPresence() {
  // Report presence only — never return secret values.
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

async function diagnoseDatabase(): Promise<DatabaseReadiness> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return {
      ok: false,
      error: "DATABASE_URL is not configured",
    };
  }

  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();

    const result = await client.query<{
      database_name: string;
      database_user: string;
      current_schema: string | null;
      search_path: string;
      server_address: string | null;
      server_port: number;
      app_user: string | null;
      delivery: string | null;
      alert_event: string | null;
    }>(`
      SELECT
        current_database() AS database_name,
        current_user AS database_user,
        current_schema() AS current_schema,
        current_setting('search_path') AS search_path,
        inet_server_addr()::text AS server_address,
        inet_server_port() AS server_port,
        to_regclass('public.app_user')::text AS app_user,
        to_regclass('public.delivery')::text AS delivery,
        to_regclass('public.alert_event')::text AS alert_event
    `);

    const row = result.rows[0];

    const tables = {
      appUser: Boolean(row.app_user),
      delivery: Boolean(row.delivery),
      alertEvent: Boolean(row.alert_event),
    };

    const allTablesPresent =
      tables.appUser && tables.delivery && tables.alertEvent;

    return {
      ok: allTablesPresent,
      databaseName: row.database_name,
      databaseUser: row.database_user,
      currentSchema: row.current_schema ?? undefined,
      searchPath: row.search_path,
      serverAddress: row.server_address ?? undefined,
      serverPort: row.server_port,
      tables,
      ...(!allTablesPresent
        ? {
            error:
              "Database connection succeeded, but one or more required tables are missing",
          }
        : {}),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  } finally {
    await client.end().catch(() => undefined);
  }
}

export async function GET(request: Request) {
  const checks: Check[] = [];

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
    // SharePoint remains optional because the app has local fallback files.
    ok: true,
    detail: isSharePointConfigured()
      ? "configured"
      : "not configured (serving local fallback workbooks)",
  });

  const requestUrl = new URL(request.url);
  const deep = requestUrl.searchParams.get("deep");
  const databaseCheck = requestUrl.searchParams.get("database");

  let sharePointReadiness: Record<string, unknown> | undefined;
  let databaseReadiness: DatabaseReadiness | undefined;

  if (deep || databaseCheck) {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        {
          error:
            "Unauthorized: deep and database readiness checks require REVALIDATE_SECRET",
        },
        { status: 401 },
      );
    }
  }

  if (databaseCheck) {
    databaseReadiness = await diagnoseDatabase();

    checks.push({
      name: "database-readiness",
      ok: databaseReadiness.ok,
      detail: databaseReadiness.ok
        ? "database connection succeeded and required tables are present"
        : (databaseReadiness.error ?? "database readiness failed"),
    });
  }

  if (deep) {
    if (!isSharePointConfigured()) {
      sharePointReadiness = {
        skipped: true,
        reason: "SharePoint not configured",
      };
    } else {
      // Probe one workbook only, not all 21.
      const diagnostic = await diagnoseKpiSource("kpi-01");

      sharePointReadiness = {
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
      ...(databaseReadiness ? { database: databaseReadiness } : {}),
      ...(sharePointReadiness ? { readiness: sharePointReadiness } : {}),
    },
    {
      status: ok ? 200 : 503,
    },
  );
}
