import "server-only"
import { getKpiSheetRows } from "@/lib/kpi-data/get-rows"
import { deriveKpi07, toIncidentLog, type Kpi07Data, type RawKpi07Row } from "./kpi-data"

/**
 * Server-only live loader for KPI-07. Reads the current workbook from SharePoint
 * (or local fallback), maps the Incident Log sheet, and derives all figures.
 */
export async function getKpi07Data(): Promise<Kpi07Data> {
  const rows = await getKpiSheetRows<RawKpi07Row>("kpi-07", "Incident Log")
  return deriveKpi07(toIncidentLog(rows))
}
