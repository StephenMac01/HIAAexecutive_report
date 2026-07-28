import "server-only"
import { readFileSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import * as XLSX from "xlsx"

/**
 * Central, deploy-safe access to the per-KPI Excel workbooks.
 *
 * Every KPI is powered by a single flat file that lives in its own folder so it
 * can be dropped into a per-KPI SharePoint document library:
 *
 *   data/kpi-NN/kpi-NN.xlsx
 *
 * All server-side loaders read through this module, so the `data/` path
 * convention and the Vercel file-tracing contract live in ONE place. The
 * matching `outputFileTracingIncludes` entry in `next.config.mjs` guarantees
 * these workbooks are bundled into the serverless output, so `readFileSync`
 * keeps working even if a route opts into dynamic rendering.
 */

/** Absolute path to a KPI workbook (`data/kpi-NN/kpi-NN.xlsx`). */
export function workbookPath(kpiId: string): string {
  return join(process.cwd(), "data", kpiId, `${kpiId}.xlsx`)
}

/** Read a KPI workbook synchronously. Defaults to typed JS dates (`cellDates`). */
export function readKpiWorkbook(
  kpiId: string,
  opts: XLSX.ParsingOptions = { cellDates: true },
): XLSX.WorkBook {
  return XLSX.read(readFileSync(workbookPath(kpiId)), { type: "buffer", ...opts })
}

/** Async variant of {@link readKpiWorkbook} for loaders that await file I/O. */
export async function readKpiWorkbookAsync(
  kpiId: string,
  opts: XLSX.ParsingOptions = { cellDates: true },
): Promise<XLSX.WorkBook> {
  return XLSX.read(await readFile(workbookPath(kpiId)), { type: "buffer", ...opts })
}

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

/** Convenience: read a KPI workbook and return one sheet's rows in a single call. */
export function readKpiRows<T = Record<string, unknown>>(
  kpiId: string,
  sheet = "Data",
  opts?: XLSX.ParsingOptions,
): T[] {
  return sheetRows<T>(readKpiWorkbook(kpiId, opts), sheet)
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
