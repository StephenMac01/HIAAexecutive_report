import "server-only"
import { getKpiWorkbook } from "@/lib/kpi-data/get-rows"
import * as XLSX from "xlsx"
import { byMonth, rowToEvent, summarize, type ChangeEvent, type KpiSummary, type MonthlyPoint } from "./kpi"

export type Kpi14Data = {
  events: ChangeEvent[]
  summary: KpiSummary
  monthly: MonthlyPoint[]
}

/**
 * Server-only live loader for KPI-14. Mirrors the client dashboard's parse
 * (Events sheet, array-of-arrays, skip header) but reads the workbook bytes
 * from SharePoint (or local fallback) on the server.
 */
export async function getKpi14Data(): Promise<Kpi14Data> {
  const wb = await getKpiWorkbook("kpi-14")
  const sheet = wb.Sheets["Events"] ?? wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 })
  const events = rows
    .slice(1)
    .filter((r) => Array.isArray(r) && r[0])
    .map(rowToEvent)
  return { events, summary: summarize(events), monthly: byMonth(events) }
}
