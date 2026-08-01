// KPI-07 — Regulatory/TC infraction or security incident
// Threshold: Fail = 1, Target = 0, Success = n/a
// Damage Points: 50 per event | Advantage Points: n/a
//
// Pure types, scoring constants, and derivation logic.
// SAFE TO IMPORT IN CLIENT COMPONENTS (no filesystem / no xlsx here).
// Live rows are fetched + derived server-side in ./get-data.ts and passed down as props.

export const KPI_META = {
  id: "KPI-07",
  title: "Regulatory/TC Infraction or Security Incident",
  target: 0,
  failThreshold: 1,
  damagePointsPerEvent: 50,
  description:
    "The Contractor, through the negligent acts or omissions of its personnel, or through a material failure to comply with applicable post orders, regulatory requirements, or HIAA security procedures, either failed to accurately document or materially contributed to unauthorized access into a restricted area.",
} as const

export type IncidentCategory =
  | "Regulatory"
  | "Post Order"
  | "HIAA Security Procedure"
  | "Unauthorized Access"
  | "Documentation Failure"

export type IncidentSeverity = "Critical" | "Major" | "Minor"

export interface Incident {
  id: string
  date: string
  category: IncidentCategory
  location: string
  severity: IncidentSeverity
  description: string
  damagePoints: number
  status: "Confirmed" | "Under Review" | "Disputed"
}

export type CategoryDatum = { category: string; count: number }
export type MonthlyDatum = { month: string; incidents: number; damagePoints: number }

export type Kpi07Summary = {
  totalIncidents: number
  totalDamagePoints: number
  compliantMonths: number
  complianceRate: number
  daysSinceLastIncident: number
}

export type Kpi07Data = {
  incidentLog: Incident[]
  categoryBreakdown: CategoryDatum[]
  monthlyIncidents: MonthlyDatum[]
  summary: Kpi07Summary
}

export type RawKpi07Row = {
  "Incident ID": string
  Date: string
  Category: string
  Location: string
  Severity: string
  "Damage Points": string | number
  Status: string
  Description: string
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// Days since the most recent incident are measured relative to this reference date.
const REFERENCE_DATE = new Date("2026-07-17")

/** Map raw workbook rows into the typed incident log. */
export function toIncidentLog(rows: RawKpi07Row[]): Incident[] {
  return rows.map((r) => ({
    id: String(r["Incident ID"]),
    date: String(r.Date).slice(0, 10),
    category: r.Category as IncidentCategory,
    location: String(r.Location),
    severity: r.Severity as IncidentSeverity,
    description: String(r.Description),
    damagePoints: Number(r["Damage Points"]) || 0,
    status: r.Status as Incident["status"],
  }))
}

/** Derive every figure the dashboard needs from the incident log. */
export function deriveKpi07(incidentLog: Incident[]): Kpi07Data {
  const categoryBreakdown = Object.entries(
    incidentLog.reduce<Record<string, number>>((acc, i) => {
      acc[i.category] = (acc[i.category] ?? 0) + 1
      return acc
    }, {}),
  ).map(([category, count]) => ({ category, count }))

  const monthlyIncidents: MonthlyDatum[] = MONTH_LABELS.map((month, i) => {
    const inMonth = incidentLog.filter((inc) => new Date(inc.date).getMonth() === i)
    return {
      month,
      incidents: inMonth.length,
      damagePoints: inMonth.reduce((s, inc) => s + inc.damagePoints, 0),
    }
  })

  const totalIncidents = monthlyIncidents.reduce((sum, m) => sum + m.incidents, 0)
  const totalDamagePoints = monthlyIncidents.reduce((sum, m) => sum + m.damagePoints, 0)
  const compliantMonths = monthlyIncidents.filter((m) => m.incidents === 0).length
  const complianceRate = Math.round((compliantMonths / monthlyIncidents.length) * 100)

  const lastIncidentDate = incidentLog
    .map((i) => new Date(i.date))
    .filter((d) => d.getTime() <= REFERENCE_DATE.getTime())
    .sort((a, b) => b.getTime() - a.getTime())[0]
  const daysSinceLastIncident = lastIncidentDate
    ? Math.round((REFERENCE_DATE.getTime() - lastIncidentDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return {
    incidentLog,
    categoryBreakdown,
    monthlyIncidents,
    summary: {
      totalIncidents,
      totalDamagePoints,
      compliantMonths,
      complianceRate,
      daysSinceLastIncident,
    },
  }
}
