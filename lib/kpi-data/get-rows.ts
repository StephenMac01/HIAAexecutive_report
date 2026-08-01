import "server-only"
import type * as XLSX from "xlsx"
import { getKpiWorkbookBuffer } from "@/lib/sharepoint/workbook-source"
import { parseWorkbookBuffer, sheetRows } from "@/lib/xlsx-loader"

/**
 * Unified live accessor for KPI workbook data.
 *
 * This is the one function every KPI loader should call: it pulls the current
 * bytes from SharePoint (or local fallback), parses them, and hands back typed
 * rows — so all 21 KPIs share the exact same freshness + caching semantics.
 */

/** Fetch the parsed workbook for a KPI (live, ISR-cached). */
export async function getKpiWorkbook(
  kpiId: string,
  opts?: XLSX.ParsingOptions,
): Promise<XLSX.WorkBook> {
  const buffer = await getKpiWorkbookBuffer(kpiId)
  return parseWorkbookBuffer(buffer, opts)
}

/**
 * Fetch a single sheet's rows for a KPI as typed objects. Falls back to the
 * first sheet when the named sheet is absent (matching `sheetRows`).
 */
export async function getKpiSheetRows<T = Record<string, unknown>>(
  kpiId: string,
  sheet = "Data",
  opts?: XLSX.Sheet2JSONOpts,
): Promise<T[]> {
  const wb = await getKpiWorkbook(kpiId)
  return sheetRows<T>(wb, sheet, opts)
}
