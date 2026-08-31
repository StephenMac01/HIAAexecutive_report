// KPI-13 — Shift Briefings: types, metadata, and pure derivation helpers.
// The actual event rows come from the Excel workbook (see lib/kpi-source.ts),
// so every function here takes an events array rather than owning the data.

export const KPI_META = {
  id: "KPI-13",
  name: "Shift Briefings",
  calculation:
    "Team Leads are required to conduct shift briefings in accordance with applicable HIAA post orders, operational procedures, and documented briefing requirements. A failure to conduct or communicate required operational or security information during a shift briefing will count as one (1) event.",
  target: 0,
  failThreshold: 1,
  damagePointsPerEvent: 2,
  periodLabel: "June 2026",
  contractor: "HIAA Security Services",
  sourceFile: "KPI-13-Shift-Briefings.xlsx",
} as const

export type Shift = "Day" | "Swing" | "Night"
export type EventStatus = "Missed Briefing" | "Incomplete Info" | "Late Briefing"

export interface BriefingEvent {
  id: string
  date: string // YYYY-MM-DD
  week: string // e.g. "Week 1"
  weekStarting: string // YYYY-MM-DD (Monday of the reporting week)
  shift: Shift
  teamLead: string
  post: string
  description: string
  status: EventStatus
  damagePoints: number
}

// Per-period total scheduled briefings (30 days x 3 shifts x 6 posts) used to
// compute the compliance rate.
export const TOTAL_SCHEDULED_BRIEFINGS = 540

// ---- Derived metrics (pure) -----------------------------------------------

export function getTotals(events: BriefingEvent[]) {
  const totalEvents = events.length
  const totalDamagePoints = events.reduce((s, e) => s + e.damagePoints, 0)
  const complianceRate =
    ((TOTAL_SCHEDULED_BRIEFINGS - totalEvents) / TOTAL_SCHEDULED_BRIEFINGS) * 100
  const meetsTarget = totalEvents <= KPI_META.target
  return {
    totalEvents,
    totalDamagePoints,
    complianceRate,
    meetsTarget,
    totalScheduled: TOTAL_SCHEDULED_BRIEFINGS,
    completed: TOTAL_SCHEDULED_BRIEFINGS - totalEvents,
  }
}

export function getEventsByShift(events: BriefingEvent[]) {
  const shifts: Shift[] = ["Day", "Swing", "Night"]
  return shifts.map((shift) => {
    const rows = events.filter((e) => e.shift === shift)
    return {
      shift,
      events: rows.length,
      damagePoints: rows.reduce((s, e) => s + e.damagePoints, 0),
    }
  })
}

export function getEventsByTeamLead(events: BriefingEvent[]) {
  const leads = Array.from(new Set(events.map((e) => e.teamLead)))
  return leads
    .map((teamLead) => {
      const rows = events.filter((e) => e.teamLead === teamLead)
      return {
        teamLead,
        events: rows.length,
        damagePoints: rows.reduce((s, e) => s + e.damagePoints, 0),
      }
    })
    .sort((a, b) => b.events - a.events)
}

export function getWeeklyTrend(events: BriefingEvent[]) {
  // Group by the Week / Week Starting columns coming from the workbook.
  const map = new Map<string, { week: string; weekStarting: string; events: number; damagePoints: number }>()
  for (const e of events) {
    const key = e.weekStarting || e.week
    const existing = map.get(key)
    if (existing) {
      existing.events += 1
      existing.damagePoints += e.damagePoints
    } else {
      map.set(key, { week: e.week, weekStarting: e.weekStarting, events: 1, damagePoints: e.damagePoints })
    }
  }
  return Array.from(map.values())
    .sort((a, b) => (a.weekStarting < b.weekStarting ? -1 : 1))
    .map((w) => ({ ...w, target: 0 }))
}

export function getStatusBreakdown(events: BriefingEvent[]) {
  const statuses: EventStatus[] = ["Missed Briefing", "Incomplete Info", "Late Briefing"]
  return statuses.map((status) => ({
    status,
    events: events.filter((e) => e.status === status).length,
  }))
}
