// KPI-12 — OLA (Official Languages Act) compliance data
// Each incident counts as one (1) event. Target = 0, Fail = 1, each event = 10 damage points.
//
// Source of truth: data/kpi-12/kpi-12.xlsx (Incident Log sheet), read live via
// lib/kpi-12/get-data.ts. This module holds only client-safe types, the KPI
// definition, and pure derivation helpers (no file I/O, safe to import anywhere).

export const kpiDefinition = {
  code: "KPI-12",
  name: "OLA",
  fullName: "Official Languages Act",
  definition:
    "The Contractor, or one of its employees, is responsible for bringing HIAA into non-compliance with the Official Languages Act.",
  calculation: "Each incident will count as one (1) event.",
  threshold: {
    fail: 1,
    target: 0,
    success: "n/a",
  },
  damagePointsPerEvent: 10,
  advantagePoints: "n/a",
}

export type IncidentStatus = "Resolved" | "In Review" | "Open"

export type Incident = {
  id: string
  date: string // ISO date
  period: string // e.g. "2025-Q1"
  month: string // e.g. "Jan"
  category: string
  channel: string
  location: string
  employee: string
  description: string
  status: IncidentStatus
  damagePoints: number
}

export type RawKpi12Row = {
  "Incident ID": string
  Date: string
  Period: string
  Month: string
  Category: string
  Channel: string
  Location: string
  "Responsible Party": string
  Description: string
  Status: string
  "Damage Points": string | number
}

export type MonthlyEvent = { month: string; events: number; damagePoints: number; target: number }
export type QuarterlyEvent = { period: string; events: number; damagePoints: number; status: ComplianceStatus }
export type CategoryDatum = { category: string; events: number }
export type ChannelDatum = { channel: string; events: number }
export type StatusDatum = { status: string; count: number }

export type ComplianceStatus = "Success" | "Target Met" | "Fail"

export function complianceStatus(events: number): ComplianceStatus {
  if (events >= kpiDefinition.threshold.fail) return "Fail"
  return "Target Met"
}

const MONTH_ORDER = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// ---- Pure derivation helpers (operate on a rows array) ----

export function mapIncidents(rawRows: RawKpi12Row[]): Incident[] {
  return rawRows.map((r) => ({
    id: String(r["Incident ID"]),
    date: String(r.Date).slice(0, 10),
    period: String(r.Period),
    month: String(r.Month),
    category: String(r.Category),
    channel: String(r.Channel),
    location: String(r.Location),
    employee: String(r["Responsible Party"]),
    description: String(r.Description),
    status: r.Status as IncidentStatus,
    damagePoints: Number(r["Damage Points"]) || 0,
  }))
}

export function getMonthlyEvents(incidents: Incident[]): MonthlyEvent[] {
  return MONTH_ORDER.map((month) => {
    const events = incidents.filter((i) => i.month === month).length
    return {
      month,
      events,
      damagePoints: events * kpiDefinition.damagePointsPerEvent,
      target: kpiDefinition.threshold.target,
    }
  })
}

export function getQuarterlyEvents(incidents: Incident[]): QuarterlyEvent[] {
  return ["2025-Q1", "2025-Q2", "2025-Q3", "2025-Q4"].map((period) => {
    const events = incidents.filter((i) => i.period === period).length
    return {
      period: period.replace("2025-", ""),
      events,
      damagePoints: events * kpiDefinition.damagePointsPerEvent,
      status: complianceStatus(events),
    }
  })
}

export function getEventsByCategory(incidents: Incident[]): CategoryDatum[] {
  return Object.entries(
    incidents.reduce<Record<string, number>>((acc, i) => {
      acc[i.category] = (acc[i.category] ?? 0) + 1
      return acc
    }, {}),
  )
    .map(([category, events]) => ({ category, events }))
    .sort((a, b) => b.events - a.events)
}

export function getEventsByChannel(incidents: Incident[]): ChannelDatum[] {
  return Object.entries(
    incidents.reduce<Record<string, number>>((acc, i) => {
      acc[i.channel] = (acc[i.channel] ?? 0) + 1
      return acc
    }, {}),
  )
    .map(([channel, events]) => ({ channel, events }))
    .sort((a, b) => b.events - a.events)
}

export function getStatusBreakdown(incidents: Incident[]): StatusDatum[] {
  return Object.entries(
    incidents.reduce<Record<string, number>>((acc, i) => {
      acc[i.status] = (acc[i.status] ?? 0) + 1
      return acc
    }, {}),
  ).map(([status, count]) => ({ status, count }))
}
