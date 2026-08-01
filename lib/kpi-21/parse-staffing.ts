import * as XLSX from "xlsx"
import type { WeeklyStaffingRow } from "./kpi"

function pick(row: Record<string, unknown>, keys: string[]): unknown {
  const normalized = Object.keys(row).reduce<Record<string, unknown>>((acc, k) => {
    acc[k.trim().toLowerCase()] = row[k]
    return acc
  }, {})
  for (const key of keys) {
    const v = normalized[key.toLowerCase()]
    if (v !== undefined && v !== null && v !== "") return v
  }
  return undefined
}

function toDateString(value: unknown): string {
  if (value == null) return ""
  if (value instanceof Date) {
    const y = value.getUTCFullYear()
    const m = String(value.getUTCMonth() + 1).padStart(2, "0")
    const d = String(value.getUTCDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }
  const s = String(value).trim()
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`
  return s
}

function toMonthString(value: unknown): string {
  if (value == null) return ""
  if (value instanceof Date) {
    const y = value.getUTCFullYear()
    const m = String(value.getUTCMonth() + 1).padStart(2, "0")
    return `${y}-${m}`
  }
  const s = String(value).trim()
  // Already YYYY-MM or YYYY-MM-DD
  const iso = s.match(/^(\d{4})-(\d{1,2})/)
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}`
  return s
}

function toText(value: unknown): string {
  if (value == null) return ""
  return String(value).trim()
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value
  const n = Number(String(value ?? "").replace(/[^0-9.-]/g, ""))
  return Number.isFinite(n) ? n : 0
}

export function parseStaffingWorkbook(data: ArrayBuffer): WeeklyStaffingRow[] {
  const wb = XLSX.read(data, { type: "array", cellDates: true })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })

  return json
    .map((row) => {
      const weekEnding = toDateString(pick(row, ["week ending", "week", "week end", "date"]))
      // Prefer an explicit Month column, otherwise derive it from the week-ending date.
      const month =
        toMonthString(pick(row, ["month", "period"])) || toMonthString(weekEnding)
      return {
        weekEnding,
        month,
        office: toText(pick(row, ["office", "location", "site"])) || "Pass Control Office",
        shiftsScheduled: toNumber(pick(row, ["shifts scheduled", "scheduled", "total shifts", "shifts"])),
        shiftsFilled: toNumber(pick(row, ["shifts filled", "filled", "shifts covered", "covered"])),
        reportedBy: toText(pick(row, ["reported by", "reporter", "submitted by"])),
        notes: toText(pick(row, ["notes", "note", "comments", "comment"])),
      }
    })
    .filter((r) => r.month && (r.shiftsScheduled > 0 || r.shiftsFilled > 0))
    .sort((a, b) => a.weekEnding.localeCompare(b.weekEnding))
}

export async function loadStaffingFromUrl(url: string): Promise<WeeklyStaffingRow[]> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`)
  const buf = await res.arrayBuffer()
  return parseStaffingWorkbook(buf)
}
