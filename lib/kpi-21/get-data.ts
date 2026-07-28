import "server-only"
import * as XLSX from "xlsx"
import { getKpiWorkbook } from "@/lib/kpi-data/get-rows"
import { parseStaffingWorkbook } from "./parse-staffing"
import { buildRecords, groupWeeksToMonths, summarize, type KpiSummary, type StaffingRecord } from "./kpi"

export type Kpi21Data = {
  records: StaffingRecord[]
  summary: KpiSummary
}

/**
 * Server-only live loader for KPI-21. Reuses the existing staffing parser but
 * feeds it the workbook bytes streamed from SharePoint (or local fallback).
 */
export async function getKpi21Data(): Promise<Kpi21Data> {
  const wb = await getKpiWorkbook("kpi-21", { cellDates: true })
  // Re-serialize to an ArrayBuffer so the existing pure parser can consume it.
  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer
  const weeks = parseStaffingWorkbook(buf)
  const records = buildRecords(groupWeeksToMonths(weeks))
  return { records, summary: summarize(records) }
}
