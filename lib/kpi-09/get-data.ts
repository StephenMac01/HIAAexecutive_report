import "server-only"
import { getKpiSheetRows } from "@/lib/kpi-data/get-rows"
import { deriveTimeliness, type TimelinessData } from "./kpi-data"

/**
 * Server-only live loader for KPI-09. Reads the current workbook from SharePoint
 * (or local fallback) and derives the timeliness dataset.
 */
export async function getTimelinessData(): Promise<TimelinessData> {
  const rows = await getKpiSheetRows<Record<string, unknown>>("kpi-09")
  return deriveTimeliness(rows)
}
