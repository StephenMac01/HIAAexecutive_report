import "server-only"
import { getKpiSheetRows } from "@/lib/kpi-data/get-rows"
import {
  mapIncidents,
  getMonthlyEvents,
  getEventsByCategory,
  getStatusBreakdown,
  complianceStatus,
  kpiDefinition,
  type RawKpi12Row,
  type Incident,
  type MonthlyEvent,
  type CategoryDatum,
  type StatusDatum,
} from "./kpi-data"

export type Kpi12Data = {
  incidents: Incident[]
  totalEvents: number
  totalDamagePoints: number
  monthlyEvents: MonthlyEvent[]
  eventsByCategory: CategoryDatum[]
  statusBreakdown: StatusDatum[]
}

export async function getKpi12Data(): Promise<Kpi12Data> {
  const rows = await getKpiSheetRows<RawKpi12Row>("kpi-12", "Incident Log")
  const incidents = mapIncidents(rows)
  return {
    incidents,
    totalEvents: incidents.length,
    totalDamagePoints: incidents.reduce((sum, i) => sum + i.damagePoints, 0),
    monthlyEvents: getMonthlyEvents(incidents),
    eventsByCategory: getEventsByCategory(incidents),
    statusBreakdown: getStatusBreakdown(incidents),
  }
}

export { complianceStatus, kpiDefinition }
