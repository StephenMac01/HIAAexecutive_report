import "server-only"
import * as XLSX from "xlsx"

/**
 * Pure Excel *parsing* utilities — no file system, no SharePoint, no Graph.
 *
 * This module only turns bytes into rows and coerces cell values. Where the
 * bytes come from (SharePoint via Graph, or the bundled local fallback) is the
 * job of `lib/sharepoint/workbook-source.ts`, and the typed bridge every KPI
 * loader calls is `lib/kpi-data/get-rows.ts`. Keeping this file free of I/O is
 * what lets all 21 KPIs share one source-agnostic pipeline:
 *
 *   dashboard → get-data → get-rows → workbook-source → graph-client → Graph
 */

/** Parse an in-memory workbook buffer (e.g. bytes downloaded from SharePoint). */
export function parseWorkbookBuffer(
  buffer: ArrayBuffer,
  opts: XLSX.ParsingOptions = { cellDates: true },
): XLSX.WorkBook {
  return XLSX.read(buffer, { type: "array", ...opts })
}

/**
 * Return the rows of a sheet as typed objects. Falls back to the first sheet if
 * the named sheet is missing, and returns `[]` when the sheet cannot be found.
 */
export function sheetRows<T = Record<string, unknown>>(
  wb: XLSX.WorkBook,
  sheet: string,
  opts: XLSX.Sheet2JSONOpts = { defval: "" },
): T[] {
  const ws = wb.Sheets[sheet] ?? wb.Sheets[wb.SheetNames[0]]
  if (!ws) return []
  return XLSX.utils.sheet_to_json<T>(ws, opts)
}

/** Coerce an arbitrary Excel cell value into a finite number (0 when unparseable). */
export function coerceNumber(value: unknown): number {
  const n = typeof value === "string" ? Number(value.replace(/[^0-9.-]/g, "")) : Number(value)
  return Number.isFinite(n) ? n : 0
}

/**
 * Coerce an Excel cell into an ISO date string (`YYYY-MM-DD`). Handles JS
 * `Date` objects (from `cellDates`), Excel serial numbers, and date strings.
 */
export function coerceISODate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === "number") {
    const d = XLSX.SSF.parse_date_code(value)
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`
    return ""
  }
  return String(value ?? "").slice(0, 10)
}
