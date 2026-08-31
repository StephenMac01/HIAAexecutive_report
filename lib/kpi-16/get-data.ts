import "server-only"
import { getKpiSheetRows } from "@/lib/kpi-data/get-rows"
import {
  mapIncidentLog,
  deriveIncidents,
  buildMonthlySummary,
  computeKpiTotals,
  type RawKpi16Row,
  type Incident,
  type MonthlySummary,
  type KpiTotals,
} from "./kpi-data"

export type Kpi16Data = {
  incidents: Incident[]
  monthlySummary: MonthlySummary[]
  totals: KpiTotals
}

export async function getKpi16Data(): Promise<Kpi16Data> {
  const rows = await getKpiSheetRows<RawKpi16Row>("kpi-16", "Incident Log")
  const incidents = deriveIncidents(mapIncidentLog(rows))
  return {
    incidents,
    monthlySummary: buildMonthlySummary(incidents),
    totals: computeKpiTotals(incidents),
  }
}
