// KPI-16 — Response Times
// Client-safe module: types, KPI definition, and pure derivation helpers.
// The live workbook is read server-side in lib/kpi-16/get-data.ts; this file
// contains no file I/O so it is safe to import from client components.
//
// KPI definition (per contract spec):
//   Calculation : Initial officer response time to emergency incidents must not
//                 exceed 5 minutes, and non-emergencies 15 minutes. Each failure
//                 to respond within the required time frame is counted as 1 event.
//   Threshold   : Fail = 1 event, Target = 0 events, Success = n/a
//   Damage      : 5 damage points per event. Advantage points = n/a

export const KPI_META = {
  id: "KPI-16",
  name: "Response Times",
  calculation:
    "Initial officer response time to emergency incidents not to exceed 5-minutes, and non-Emergencies 15 minutes. Each failure to respond within required time frames will be counted as one (1) event. HIAA will engage with the Contractor to discuss such response times prior to administering any Damage points.",
  emergencyTargetMinutes: 5,
  nonEmergencyTargetMinutes: 15,
  threshold: { fail: 1, target: 0, success: "n/a" },
  damagePointsPerEvent: 5,
  advantagePoints: "n/a",
} as const

export type IncidentType = "Emergency" | "Non-Emergency"
export type IncidentStatus = "Within SLA" | "Breach"

// The columns the data owner fills in each week (one row per response).
export interface RawIncident {
  weekNumber: number
  weekEnding: string // ISO date of the Sunday that closes the week
  id: string
  date: string // ISO date the incident occurred
  time: string // HH:mm (24h)
  location: string
  type: IncidentType
  responseMinutes: number
}

// A fully-computed incident row (raw fields + derived columns).
export interface Incident extends RawIncident {
  targetMinutes: number
  status: IncidentStatus
  event: 0 | 1
  damagePoints: number
}

export interface MonthlySummary {
  month: string
  emergencyCount: number
  nonEmergencyCount: number
  emergencyBreaches: number
  nonEmergencyBreaches: number
  avgEmergencyMinutes: number
  avgNonEmergencyMinutes: number
}

export type RawKpi16Row = {
  "Week #": string | number
  "Week Ending": string
  "Incident ID": string
  Date: string
  Time: string
  Location: string
  Type: string
  "Response (min)": string | number
}

// Map raw worksheet rows to the incident log the data owner maintains.
export function mapIncidentLog(rawRows: RawKpi16Row[]): RawIncident[] {
  return rawRows.map((r) => ({
    weekNumber: Number(r["Week #"]) || 0,
    weekEnding: String(r["Week Ending"]).slice(0, 10),
    id: String(r["Incident ID"]),
    date: String(r.Date).slice(0, 10),
    time: String(r.Time),
    location: String(r.Location),
    type: r.Type as IncidentType,
    responseMinutes: Number(r["Response (min)"]) || 0,
  }))
}

function targetFor(type: IncidentType): number {
  return type === "Emergency" ? KPI_META.emergencyTargetMinutes : KPI_META.nonEmergencyTargetMinutes
}

// Derive the full incident rows (adds Target / Status / Event / Damage Points).
export function deriveIncidents(incidentLog: RawIncident[]): Incident[] {
  return incidentLog.map((r) => {
    const targetMinutes = targetFor(r.type)
    const isBreach = r.responseMinutes > targetMinutes
    return {
      ...r,
      targetMinutes,
      status: isBreach ? "Breach" : "Within SLA",
      event: isBreach ? 1 : 0,
      damagePoints: isBreach ? KPI_META.damagePointsPerEvent : 0,
    }
  })
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function buildMonthlySummary(rows: Incident[]): MonthlySummary[] {
  const byMonth = new Map<string, Incident[]>()
  for (const inc of rows) {
    const key = inc.date.slice(0, 7) // YYYY-MM
    if (!byMonth.has(key)) byMonth.set(key, [])
    byMonth.get(key)!.push(inc)
  }
  return [...byMonth.keys()]
    .sort()
    .map((key) => {
      const group = byMonth.get(key)!
      const em = group.filter((g) => g.type === "Emergency")
      const non = group.filter((g) => g.type === "Non-Emergency")
      const monthIndex = Number.parseInt(key.slice(5, 7), 10) - 1
      return {
        month: MONTH_LABELS[monthIndex] ?? key,
        emergencyCount: em.length,
        nonEmergencyCount: non.length,
        emergencyBreaches: em.reduce((s, g) => s + g.event, 0),
        nonEmergencyBreaches: non.reduce((s, g) => s + g.event, 0),
        avgEmergencyMinutes: avg(em.map((g) => g.responseMinutes)),
        avgNonEmergencyMinutes: avg(non.map((g) => g.responseMinutes)),
      }
    })
}

export interface KpiTotals {
  totalIncidents: number
  emergencyIncidents: number
  nonEmergencyIncidents: number
  totalEvents: number
  emergencyEvents: number
  nonEmergencyEvents: number
  damagePoints: number
  emergencyCompliancePct: number
  nonEmergencyCompliancePct: number
  overallCompliancePct: number
  weeksTracked: number
  periodStart: string
  periodEnd: string
  status: "Success" | "Fail"
}

export function computeKpiTotals(incidents: Incident[]): KpiTotals {
  const emergency = incidents.filter((i) => i.type === "Emergency")
  const nonEmergency = incidents.filter((i) => i.type === "Non-Emergency")

  const emergencyIncidents = emergency.length
  const nonEmergencyIncidents = nonEmergency.length
  const emergencyEvents = emergency.reduce((s, i) => s + i.event, 0)
  const nonEmergencyEvents = nonEmergency.reduce((s, i) => s + i.event, 0)
  const totalIncidents = incidents.length
  const totalEvents = emergencyEvents + nonEmergencyEvents

  const dates = incidents.map((i) => i.date).sort()
  const weeks = new Set(incidents.map((i) => i.weekNumber))

  return {
    totalIncidents,
    emergencyIncidents,
    nonEmergencyIncidents,
    totalEvents,
    emergencyEvents,
    nonEmergencyEvents,
    damagePoints: totalEvents * KPI_META.damagePointsPerEvent,
    emergencyCompliancePct: compliance(emergencyIncidents, emergencyEvents),
    nonEmergencyCompliancePct: compliance(nonEmergencyIncidents, nonEmergencyEvents),
    overallCompliancePct: compliance(totalIncidents, totalEvents),
    weeksTracked: weeks.size,
    periodStart: dates[0] ?? "",
    periodEnd: dates[dates.length - 1] ?? "",
    status: totalEvents <= KPI_META.threshold.target ? "Success" : "Fail",
  }
}

function compliance(total: number, events: number): number {
  if (total === 0) return 100
  return round1(((total - events) / total) * 100)
}

function avg(values: number[]): number {
  if (values.length === 0) return 0
  return round1(values.reduce((s, v) => s + v, 0) / values.length)
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}
