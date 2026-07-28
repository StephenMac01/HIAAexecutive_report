import "server-only"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { downloadSiteFile, isSharePointConfigured } from "@/lib/sharepoint/graph-client"

/**
 * Single source of truth for the raw bytes of a KPI workbook.
 *
 * Resolution order:
 *   1. SharePoint (when configured) — `{BASE}/kpi-NN/kpi-NN.xlsx`, ISR-cached.
 *   2. Local fallback — `data/kpi-NN/kpi-NN.xlsx` bundled with the app.
 *
 * The fallback keeps preview/dev fully functional before any SharePoint
 * credentials are added, and also protects production against a transient
 * Graph outage.
 */

/** Cache tag for a KPI's workbook, used by the revalidate webhook. */
export function kpiCacheTag(kpiId: string): string {
  return `kpi:${kpiId}`
}

/**
 * Default ISR window (seconds) for a KPI workbook fetch. Configurable via the
 * `KPI_CACHE_SECONDS` env var so internal deployments can choose their model:
 *   - Webhook-driven (Power Automate → /api/revalidate): keep this high (e.g.
 *     300) since refreshes are pushed on demand.
 *   - Poll-only (no webhook): set it low (e.g. 60) so changes appear within
 *     ~a minute with zero flow/gateway setup.
 * Falls back to 300s when unset or invalid.
 */
function defaultCacheSeconds(): number {
  const raw = Number(process.env.KPI_CACHE_SECONDS)
  return Number.isFinite(raw) && raw >= 0 ? raw : 300
}

/**
 * Drive-relative path of a KPI workbook inside the document library.
 *
 * Configurable via `SHAREPOINT_FILE_TEMPLATE` so the app matches however the
 * HIAA KPI library is actually laid out. `{id}` expands to the KPI id
 * (e.g. "kpi-01"). Examples:
 *   - "{id}.xlsx"          → kpi-01.xlsx           (flat library — the default)
 *   - "{id}/{id}.xlsx"     → kpi-01/kpi-01.xlsx    (one folder per KPI)
 *   - "KPIs/{id}.xlsx"     → KPIs/kpi-01.xlsx      (shared sub-folder)
 *
 * Any `SHAREPOINT_BASE_PATH` is prepended to this by `downloadSiteFile`.
 */
function kpiDrivePath(kpiId: string): string {
  const template = process.env.SHAREPOINT_FILE_TEMPLATE?.trim() || "{id}.xlsx"
  return template.replace(/\{id\}/g, kpiId).replace(/^\/+/, "")
}

/** Absolute path to the bundled local fallback workbook. */
function localWorkbookPath(kpiId: string): string {
  return join(process.cwd(), "data", kpiId, `${kpiId}.xlsx`)
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
      })
    } catch (error) {
      console.log(
        `[v0] SharePoint fetch failed for ${kpiId}, falling back to local file:`,
        error instanceof Error ? error.message : error,
      )
    }
  }

  const buf = await readFile(localWorkbookPath(kpiId))
  // Return a standalone ArrayBuffer slice (Node Buffer views a shared pool).
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
}

/**
 * Fetch a KPI workbook's bytes for a live download (never cached), so the file
 * a user downloads always matches SharePoint exactly.
 */
export async function getKpiWorkbookForDownload(kpiId: string): Promise<ArrayBuffer> {
  return getKpiWorkbookBuffer(kpiId, { cacheSeconds: 0 })
}
