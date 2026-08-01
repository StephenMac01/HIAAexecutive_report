import "server-only"
import { sheetRows } from "@/lib/xlsx-loader"
import { getKpiWorkbook } from "@/lib/kpi-data/get-rows"
import { KPI_META, type BriefingEvent, type Shift, type EventStatus } from "./kpi-data"

// Reads the KPI-13 workbook and parses the "Event Log" sheet into typed events.
// This makes the Excel file the single source of truth for the dashboard:
// whatever the data owner adds to the sheet is what the dashboard renders.

const SHEET_NAME = "Event Log"

function normalizeShift(v: unknown): Shift {
  const s = String(v ?? "").trim().toLowerCase()
  if (s.startsWith("night")) return "Night"
  if (s.startsWith("swing")) return "Swing"
  return "Day"
}

function normalizeStatus(v: unknown): EventStatus {
  const s = String(v ?? "").trim().toLowerCase()
  if (s.startsWith("miss")) return "Missed Briefing"
  if (s.startsWith("late")) return "Late Briefing"
  return "Incomplete Info"
}

function toDateString(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return String(v ?? "").trim()
}

export async function loadBriefingEvents(): Promise<BriefingEvent[]> {
  const wb = await getKpiWorkbook("kpi-13")
  if (!wb.Sheets[SHEET_NAME]) return []

  const rows = sheetRows<Record<string, unknown>>(wb, SHEET_NAME)

  return rows
    .filter((r) => String(r["Event ID"] ?? "").trim() !== "")
    .map((r) => ({
      id: String(r["Event ID"]).trim(),
      date: toDateString(r["Date"]),
      week: String(r["Week"] ?? "").trim(),
      weekStarting: toDateString(r["Week Starting"]),
      shift: normalizeShift(r["Shift"]),
      teamLead: String(r["Team Lead"] ?? "").trim(),
      post: String(r["Post"] ?? "").trim(),
      description: String(r["Description"] ?? "").trim(),
      status: normalizeStatus(r["Status"]),
      damagePoints: Number(r["Damage Points"] ?? KPI_META.damagePointsPerEvent) || KPI_META.damagePointsPerEvent,
    }))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
}
