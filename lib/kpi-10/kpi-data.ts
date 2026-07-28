// KPI-10 — Uniform Compliance
//
// Pure types, constants, and derivation logic.
// SAFE TO IMPORT IN CLIENT COMPONENTS (no filesystem / no xlsx here).
// Live daily event rows are fetched server-side in ./get-data.ts and derived here.

export const kpiMeta = {
  id: "KPI-10",
  name: "Uniform",
  calculation:
    "Any individual on-site not in an HIAA approved uniform will count as 1 event.",
  threshold: {
    fail: 1,
    target: 0,
    success: "n/a",
  },
  damagePointsPerEvent: 2,
  advantagePoints: "n/a",
  reportingPeriod: "Feb 2026 · Rolling 30 days",
  lastAudit: "Jul 17, 2026 · 09:42",
} as const

export type ComplianceStatus = "success" | "target" | "fail"

export type DailyEvent = { date: string; events: number; damage: number }

export type CurrentPeriod = {
  events: number
  damagePoints: number
  status: ComplianceStatus
  personnelOnSite: number
  compliantPersonnel: number
  complianceRate: number
  consecutiveCleanDays: number
}

export type RawKpi10Row = {
  Date: string
  Events: string | number
  "Damage Points": string | number
}

const PERSONNEL_ON_SITE = 148

/** Map raw workbook rows into the daily event log. */
export function toDailyEvents(rows: RawKpi10Row[]): DailyEvent[] {
  return rows.map((r) => ({
    date: String(r.Date),
    events: Number(r.Events) || 0,
    damage: Number(r["Damage Points"]) || 0,
  }))
}

/** Roll up the current period from the daily event log. */
export function derivePeriod(dailyEvents: DailyEvent[]): CurrentPeriod {
  const totalEvents = dailyEvents.reduce((s, d) => s + d.events, 0)
  const totalDamage = dailyEvents.reduce((s, d) => s + d.damage, 0)
  // Consecutive clean days counting back from the most recent day.
  let cleanStreak = 0
  for (let i = dailyEvents.length - 1; i >= 0; i--) {
    if (dailyEvents[i].events === 0) cleanStreak++
    else break
  }
  return {
    events: totalEvents,
    damagePoints: totalDamage,
    status: totalEvents === 0 ? "target" : "fail",
    personnelOnSite: PERSONNEL_ON_SITE,
    compliantPersonnel: PERSONNEL_ON_SITE - totalEvents,
    complianceRate: Math.round(((PERSONNEL_ON_SITE - totalEvents) / PERSONNEL_ON_SITE) * 100),
    consecutiveCleanDays: cleanStreak,
  }
}

// Per-zone breakdown of on-site personnel — all fully compliant.
export const zones: {
  zone: string
  personnel: number
  compliant: number
  events: number
}[] = [
  { zone: "Terminal A", personnel: 34, compliant: 34, events: 0 },
  { zone: "Terminal B", personnel: 28, compliant: 28, events: 0 },
  { zone: "Airside Ops", personnel: 22, compliant: 22, events: 0 },
  { zone: "Cargo", personnel: 19, compliant: 19, events: 0 },
  { zone: "Landside", personnel: 26, compliant: 26, events: 0 },
  { zone: "Admin", personnel: 19, compliant: 19, events: 0 },
]

// Recent audit checkpoints — all passed (best case).
export const auditLog: {
  time: string
  zone: string
  inspector: string
  checked: number
  result: "pass" | "flag"
}[] = [
  { time: "09:42", zone: "Terminal A", inspector: "M. Alvarez", checked: 34, result: "pass" },
  { time: "09:15", zone: "Airside Ops", inspector: "R. Chen", checked: 22, result: "pass" },
  { time: "08:50", zone: "Cargo", inspector: "T. Okafor", checked: 19, result: "pass" },
  { time: "08:20", zone: "Terminal B", inspector: "M. Alvarez", checked: 28, result: "pass" },
  { time: "07:55", zone: "Landside", inspector: "S. Park", checked: 26, result: "pass" },
  { time: "07:30", zone: "Admin", inspector: "R. Chen", checked: 19, result: "pass" },
]
