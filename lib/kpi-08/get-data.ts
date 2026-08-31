import "server-only"
import { getKpiSheetRows } from "@/lib/kpi-data/get-rows"
import { deriveKpi08, type Kpi08Data, type RawKpi08Row } from "./kpi-data"

/**
 * Server-only live loader for KPI-08. Reads the current workbook from SharePoint
 * (or local fallback) and derives all patrol-compliance figures.
 */
export async function getKpi08Data(): Promise<Kpi08Data> {
  const rows = await getKpiSheetRows<RawKpi08Row>("kpi-08", "Data")
  return deriveKpi08(rows)
}
