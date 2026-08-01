// Client-safe KPI-01 module: types, static config, and pure formatters ONLY.
// This file must never import server-only code (fs / SharePoint), because
// client chart components import `kpiMeta` and the derived types from here.
// The live data loading lives in ./get-data.ts (server-only).

export type IncidentCategory =
  | "Inaccurate Information"
  | "Lack of Professionalism"
  | "Unsafe Behaviour"
  | "Refusal of Service"
  | "Destructive Behaviour"

export type EventSource = "HIAA Annual Report" | "Public Complaint" | "Operational Report"

export interface KpiEvent {
  id: string
  date: string // ISO date
  source: EventSource
  location: string
  category: IncidentCategory
  substantiated: boolean
  treatment: "Included" | "Excluded"
  damagePoints: number
}

/** KPI-01 static configuration (not derived from the workbook rows). */
export const kpiMeta = {
  id: "KPI-01",
  name: "Refusal to deliver service, delivery of inaccurate information, lack of professionalism, destructive or unsafe behaviour",
  shortName: "Service Refusal, Inaccurate Information & Unsafe Conduct",
  measurement: "Count of substantiated material events during the reporting period",
  reportingPeriod: "2026 Annual",
  target: 0,
  failThreshold: 1,
  damagePointsPerEvent: 2,
}

export type Kpi01Summary = {
  totalRecords: number
  substantiated: number
  excluded: number
  counted: number
  totalDamagePoints: number
  result: "PASS" | "FAIL"
}

export type Kpi01CategoryDatum = {
  category: IncidentCategory
  short: string
  counted: number
  excluded: number
  total: number
}

export type Kpi01SourceDatum = { source: string; total: number; counted: number }

export type Kpi01TimelineDatum = {
  month: string
  counted: number
  points: number
  threshold: number
}

export type Kpi01Data = {
  events: KpiEvent[]
  summary: Kpi01Summary
  categoryBreakdown: Kpi01CategoryDatum[]
  sourceBreakdown: Kpi01SourceDatum[]
  cumulativeTimeline: Kpi01TimelineDatum[]
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}
