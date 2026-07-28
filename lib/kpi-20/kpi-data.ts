import "server-only"
import { sheetRows, coerceISODate as toISODate } from "@/lib/xlsx-loader"
import { getKpiWorkbook } from "@/lib/kpi-data/get-rows"

import { computeDashboard, DAMAGE_PER_EVENT, MIN_REQUIRED, type Dashboard, type ShiftRow } from "./kpi"

const SHEET_NAME = "Shift Log"

type RawRow = {
  Week?: string
  "Week Starting"?: string | number
  Date?: string | number
  Shift?: string
  Team?: string
  "D Drivers On Shift"?: number | string
  "Minimum Required"?: number | string
}

// Reads the Shift Log sheet and derives the full dashboard model.
// Event / damage / compliance are always recomputed from "D Drivers On Shift"
// so the dashboard stays correct even if helper columns are left blank.
export async function getDashboard(): Promise<Dashboard> {
  // `cellDates: false` keeps date cells as Excel serials/strings so the shared
  // coerceISODate helper can normalize them.
  const wb = await getKpiWorkbook("kpi-20", { cellDates: false })
  if (!wb.Sheets[SHEET_NAME]) {
    throw new Error(`Sheet "${SHEET_NAME}" not found in workbook`)
  }

  const raw = sheetRows<RawRow>(wb, SHEET_NAME)

  const rows: ShiftRow[] = raw
    .map((r, i) => {
      const drivers = Number(r["D Drivers On Shift"] ?? 0)
      const date = toISODate(r.Date)
      const meets = drivers >= MIN_REQUIRED
      const event = meets ? 0 : 1
      const shift = String(r.Shift ?? "").trim() === "Night" ? "Night" : "Day"
      return {
        id: i + 1,
        week: String(r.Week ?? "").trim(),
        weekStarting: toISODate(r["Week Starting"]),
        date,
        shift,
        team: String(r.Team ?? "").trim(),
        driversOnShift: drivers,
        minimumRequired: MIN_REQUIRED,
        meetsRequirement: meets ? "Yes" : "No",
        event,
        damagePoints: event * DAMAGE_PER_EVENT,
      } satisfies ShiftRow
    })
    .filter((r) => r.date !== "")

  return computeDashboard(rows)
}
