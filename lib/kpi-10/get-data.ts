import "server-only"
import { getKpiSheetRows } from "@/lib/kpi-data/get-rows"
import { derivePeriod, toDailyEvents, type CurrentPeriod, type DailyEvent, type RawKpi10Row } from "./kpi-data"

/**
 * Server-only live loader for KPI-10. Reads the current workbook from SharePoint
 * (or local fallback) and derives the daily event log + current-period rollup.
 */
export async function getKpi10Data(): Promise<{ dailyEvents: DailyEvent[]; currentPeriod: CurrentPeriod }> {
  const rows = await getKpiSheetRows<RawKpi10Row>("kpi-10", "Daily Events")
  const dailyEvents = toDailyEvents(rows)
  return { dailyEvents, currentPeriod: derivePeriod(dailyEvents) }
}
