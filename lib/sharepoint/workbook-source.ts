import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  diagnoseSharePointDownload,
  downloadSiteFile,
  isSharePointConfigured,
  type SharePointDiagnostics,
} from "@/lib/sharepoint/graph-client";
import { parseWorkbookBuffer } from "@/lib/xlsx-loader";

/**
 * Single source of truth for the raw bytes of a KPI workbook.
 *
 * Resolution order:
 *   1. SharePoint (when configured) — path from `SHAREPOINT_FILE_TEMPLATE`
 *      (default flat `{id}.xlsx`) under any `SHAREPOINT_BASE_PATH`, ISR-cached.
 *   2. Local fallback — `data/kpi-NN/kpi-NN.xlsx` bundled with the app.
 *
 * The fallback keeps preview/dev fully functional before any SharePoint
 * credentials are added, and also protects production against a transient
 * Graph outage.
 */

/** Cache tag for a KPI's workbook, used by the revalidate webhook. */
export function kpiCacheTag(kpiId: string): string {
  return `kpi:${kpiId}`;
}

/**
 * Default ISR window (seconds) for a KPI workbook fetch. Configurable via
 * `KPI_CACHE_TTL_SECONDS` (preferred) or the legacy `KPI_CACHE_SECONDS`, so
 * internal deployments can choose their refresh model:
 *   - Webhook-driven (Power Automate → /api/revalidate): keep this high (e.g.
 *     300) since refreshes are pushed on demand.
 *   - Poll-only (no webhook): set it low (e.g. 60) so changes appear within
 *     ~a minute with zero flow/gateway setup.
 * Falls back to 300s when unset or invalid.
 */
function defaultCacheSeconds(): number {
  const raw = Number(
    process.env.KPI_CACHE_TTL_SECONDS ?? process.env.KPI_CACHE_SECONDS,
  );
  return Number.isFinite(raw) && raw >= 0 ? raw : 300;
}

/** Valid KPI id shape (`kpi-01` … `kpi-21`). Guards against path injection. */
const KPI_ID_RE = /^kpi-\d{2}$/;

/**
 * Drive-relative path of a KPI workbook inside the document library.
 *
 * The HIAA library uses a folder-per-KPI layout, so the default template is
 * `{id}/{id}.xlsx` → `kpi-01/kpi-01.xlsx`. Configurable via
 * `SHAREPOINT_FILE_TEMPLATE` for other layouts. `{id}` expands to the KPI id:
 *   - "{id}/{id}.xlsx"     → kpi-01/kpi-01.xlsx    (folder per KPI — the default)
 *   - "{id}.xlsx"          → kpi-01.xlsx           (flat library)
 *   - "KPIs/{id}.xlsx"     → KPIs/kpi-01.xlsx      (shared sub-folder)
 *
 * The KPI id is validated first so a malformed id can never produce a path
 * that escapes the library (no `..`, no leading slash). Any
 * `SHAREPOINT_BASE_PATH` is prepended to this by `downloadSiteFile`.
 */
function kpiDrivePath(kpiId: string): string {
  if (!KPI_ID_RE.test(kpiId)) {
    throw new Error(`Invalid KPI id "${kpiId}" — expected kpi-NN`);
  }
  const template = process.env.SHAREPOINT_FILE_TEMPLATE?.trim() || "{id}.xlsx";
  return template
    .replace(/\{id\}/g, kpiId)
    .replace(/\\/g, "/")
    .replace(/\/{2,}/g, "/")
    .replace(/(^|\/)\.\.(?=\/|$)/g, "") // strip any ".." segments
    .replace(/^\/+/, "");
}

/** Absolute path to the bundled local fallback workbook. */
function localWorkbookPath(kpiId: string): string {
  if (!KPI_ID_RE.test(kpiId)) {
    throw new Error(`Invalid KPI id "${kpiId}" — expected kpi-NN`);
  }
  return join(process.cwd(), "data", kpiId, `${kpiId}.xlsx`);
}

/**
 * Fetch a KPI workbook's bytes for server-side parsing (dashboards).
 *
 * Uses ISR caching (default 5 min) + a per-KPI cache tag so the webhook can
 * force an instant refresh. Falls back to the local file when SharePoint is
 * unconfigured or the Graph call fails.
 */
export async function getKpiWorkbookBuffer(
  kpiId: string,
  { cacheSeconds = defaultCacheSeconds() }: { cacheSeconds?: number } = {},
): Promise<ArrayBuffer> {
  if (isSharePointConfigured()) {
    try {
      return await downloadSiteFile(kpiDrivePath(kpiId), {
        cacheSeconds,
        revalidateTag: kpiCacheTag(kpiId),
      });
    } catch (error) {
      console.log(
        `[kpi] SharePoint fetch failed for ${kpiId}, falling back to local file:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  const buf = await readFile(localWorkbookPath(kpiId));
  // Return a standalone ArrayBuffer slice (Node Buffer views a shared pool).
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength,
  ) as ArrayBuffer;
}

/**
 * Fetch a KPI workbook's bytes for a live download (never cached), so the file
 * a user downloads always matches SharePoint exactly.
 */
export async function getKpiWorkbookForDownload(
  kpiId: string,
): Promise<ArrayBuffer> {
  return getKpiWorkbookBuffer(kpiId, { cacheSeconds: 0 });
}

export type KpiSourceDiagnostics = SharePointDiagnostics & {
  kpiId: string;
  parse: {
    ok: boolean;
    detail: string;
    sheetNames?: string[];
    dataRows?: number;
  };
};

/**
 * End-to-end self-test for one KPI: resolves its SharePoint path, runs the live
 * Graph download diagnostic, and (on success) verifies the bytes parse into a
 * real workbook. This answers definitively whether the full pipeline
 * SharePoint → Graph → Workbook works for a given KPI.
 */
export async function diagnoseKpiSource(
  kpiId: string,
): Promise<KpiSourceDiagnostics> {
  const drivePath = kpiDrivePath(kpiId);
  const sp = await diagnoseSharePointDownload(drivePath);

  // Only attempt a parse when the download succeeded — re-fetch the (small)
  // bytes uncached so the diagnostic reflects the live file, not the ISR cache.
  let parse: KpiSourceDiagnostics["parse"] = {
    ok: false,
    detail: "skipped (download did not succeed)",
  };
  if (sp.overallOk) {
    try {
      const bytes = await downloadSiteFile(drivePath, { cacheSeconds: 0 });
      const wb = parseWorkbookBuffer(bytes);
      const firstSheet = wb.Sheets[wb.SheetNames[0]];
      const dataRows = firstSheet
        ? Math.max(
            0,
            Object.keys(firstSheet).filter((k) => /^A\d+$/.test(k)).length - 1,
          )
        : 0;
      parse = {
        ok: true,
        detail: `parsed workbook with ${wb.SheetNames.length} sheet(s)`,
        sheetNames: wb.SheetNames,
        dataRows,
      };
    } catch (error) {
      parse = {
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return { ...sp, kpiId, parse };
}
