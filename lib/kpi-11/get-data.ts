import "server-only"
import { getKpiSheetRows } from "@/lib/kpi-data/get-rows"
import { deriveKpi11, type Kpi11Data, type RawKpi11Row } from "./kpi-data"

/**
 * Server-only live loader for KPI-11. Reads the current workbook from SharePoint
 * (or local fallback) and derives the audit log, monthly rollups, and summary.
 */
export async function getKpi11Data(): Promise<Kpi11Data> {
  const rows = await getKpiSheetRows<RawKpi11Row>("kpi-11", "Data")
  return deriveKpi11(rows)
}
