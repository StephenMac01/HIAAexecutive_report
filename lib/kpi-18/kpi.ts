// Client-safe module: types, constants, and pure derivation helpers for KPI-18.
// The live workbook (data/kpi-18/kpi-18.xlsx, "Events Log" sheet) is read
// server-side in lib/kpi-18/get-data.ts. No file I/O here.

export type KpiEvent = {
  "Event ID": string
  "Week Ending": string
  Date: string
  Time: string
  "Team Lead": string
  Team: string
  Shift: string
  Site: string
  "Incident Type": string
  Severity: string
  Description: string
  "Root Cause": string
  "Reported to DSM": string
  "Damage Points": number
}

export type MonthlyRow = {
  Month: string
  Events: number
  "Damage Points": number
  Target: number
  "Meets Target": string
}

export const DAMAGE_PER_EVENT = 10
export const TARGET = 0
export const FAIL_THRESHOLD = 1

// Coerce the sheet's string cells into the typed event shape (numbers parsed).
export function mapEvents(rawRows: Record<string, string>[]): KpiEvent[] {
  return rawRows.map((r) => ({
    "Event ID": String(r["Event ID"]),
    "Week Ending": String(r["Week Ending"]).slice(0, 10),
    Date: String(r.Date).slice(0, 10),
    Time: String(r.Time),
    "Team Lead": String(r["Team Lead"]),
    Team: String(r.Team),
    Shift: String(r.Shift),
    Site: String(r.Site),
    "Incident Type": String(r["Incident Type"]),
    Severity: String(r.Severity),
    Description: String(r.Description),
    "Root Cause": String(r["Root Cause"]),
    "Reported to DSM": String(r["Reported to DSM"]),
    "Damage Points": Number(r["Damage Points"]) || 0,
  }))
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

// Monthly summary derived from the event log (keyed YYYY-MM, all 12 months).
export function buildMonthlySummary(events: KpiEvent[]): MonthlyRow[] {
  return Array.from({ length: 12 }, (_, i) => {
    const mm = String(i + 1).padStart(2, "0")
    const inMonth = events.filter((e) => e.Date.slice(5, 7) === mm)
    const evCount = inMonth.length
    return {
      Month: `2025-${mm}`,
      Events: evCount,
      "Damage Points": inMonth.reduce((s, e) => s + e["Damage Points"], 0),
      Target: TARGET,
      "Meets Target": evCount <= TARGET ? "Yes" : "No",
    }
  })
}

export function getMonthLabel(month: string) {
  const idx = Number.parseInt(month.split("-")[1], 10) - 1
  return MONTH_LABELS[idx] ?? month
}

export function getTotals(events: KpiEvent[], monthlySummary: MonthlyRow[]) {
  const totalEvents = events.length
  const damagePoints = totalEvents * DAMAGE_PER_EVENT
  const monthsWithEvents = monthlySummary.filter((m) => m.Events > 0).length
  const monthsOnTarget = monthlySummary.filter((m) => m.Events === 0).length
  const avgPerMonth = totalEvents / monthlySummary.length
  return {
    totalEvents,
    damagePoints,
    monthsWithEvents,
    monthsOnTarget,
    avgPerMonth,
    status: totalEvents >= FAIL_THRESHOLD ? "Fail" : "Target",
  }
}

export type KpiTotals = ReturnType<typeof getTotals>

export function getMonthlyTrend(monthlySummary: MonthlyRow[]) {
  return monthlySummary.map((m) => ({
    month: getMonthLabel(m.Month),
    events: m.Events,
    damage: m["Damage Points"],
    target: TARGET,
  }))
}

export function countBy<K extends keyof KpiEvent>(events: KpiEvent[], key: K) {
  const map = new Map<string, number>()
  for (const e of events) {
    const k = String(e[key])
    map.set(k, (map.get(k) ?? 0) + 1)
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function getRecentEvents(events: KpiEvent[], limit?: number) {
  const sorted = [...events].sort((a, b) => (a.Date < b.Date ? 1 : -1))
  return limit ? sorted.slice(0, limit) : sorted
}

export function getWorstMonth(monthlySummary: MonthlyRow[]) {
  return monthlySummary.reduce((worst, m) => (m.Events > worst.Events ? m : worst), monthlySummary[0])
}
