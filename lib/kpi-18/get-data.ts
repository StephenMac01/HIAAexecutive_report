import "server-only"
import { getKpiSheetRows } from "@/lib/kpi-data/get-rows"
import {
  mapEvents,
  buildMonthlySummary,
  getTotals,
  getMonthlyTrend,
  countBy,
  getRecentEvents,
  type KpiEvent,
  type MonthlyRow,
  type KpiTotals,
} from "./kpi"

export type Kpi18Data = {
  events: KpiEvent[]
  recentEvents: KpiEvent[]
  monthlySummary: MonthlyRow[]
  totals: KpiTotals
  trend: ReturnType<typeof getMonthlyTrend>
  byLead: ReturnType<typeof countBy>
  byType: ReturnType<typeof countBy>
  bySite: ReturnType<typeof countBy>
}

export async function getKpi18Data(): Promise<Kpi18Data> {
  const rows = await getKpiSheetRows<Record<string, string>>("kpi-18", "Events Log")
  const events = mapEvents(rows)
  const monthlySummary = buildMonthlySummary(events)
  return {
    events,
    recentEvents: getRecentEvents(events),
    monthlySummary,
    totals: getTotals(events, monthlySummary),
    trend: getMonthlyTrend(monthlySummary),
    byLead: countBy(events, "Team Lead"),
    byType: countBy(events, "Incident Type"),
    bySite: countBy(events, "Site"),
  }
}
