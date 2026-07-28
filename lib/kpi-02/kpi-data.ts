// ---------------------------------------------------------------------------
// Client-safe module for KPI-02: types, rule constants, pure helpers, and the
// static multi-KPI overview. NO file/SharePoint access here so it can be
// imported by client chart components. Live data lives in ./get-data.ts.
// ---------------------------------------------------------------------------

export type ComplimentSource =
  | "Reception"
  | "Website"
  | "Information Booth"
  | "Stakeholders"
  | "Airport Operations Centre"
  | "Social Media"

export const COMPLIMENT_SOURCES: ComplimentSource[] = [
  "Reception",
  "Website",
  "Information Booth",
  "Stakeholders",
  "Airport Operations Centre",
  "Social Media",
]

export interface ComplimentEvent {
  id: string
  date: string // ISO date, as it would appear in the sheet
  source: ComplimentSource
  solicited: boolean // solicited compliments are excluded per the calculation rule
  summary: string
}

// KPI-02 rule constants pulled directly from the specification table.
export const KPI02 = {
  code: "KPI-02",
  name: "Customer Compliments",
  target: 1,
  success: 1,
  // "1 advantage point per event after receipt of 2 compliments, max 10"
  advantageFreeThreshold: 2,
  advantagePointsMax: 10,
} as const

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

export interface MonthlyPoint {
  month: string
  monthIndex: number
  counted: number // valid compliments (solicited excluded)
  solicited: number // excluded
  advantagePoints: number
  met: boolean // target of 1 met
}

export interface SourceDatum {
  source: ComplimentSource
  count: number
}

/** Advantage points per the KPI-02 rule: 1 per event after the first 2, capped at 10. */
export function advantagePoints(counted: number): number {
  return Math.min(
    Math.max(counted - KPI02.advantageFreeThreshold, 0),
    KPI02.advantagePointsMax,
  )
}

export interface Kpi02Summary {
  totalCounted: number
  totalSolicitedExcluded: number
  totalAdvantagePoints: number
  monthsMeetingTarget: number
  totalMonths: number
  bestMonth: MonthlyPoint
}

export interface Kpi02Data {
  events: ComplimentEvent[]
  monthly: MonthlyPoint[]
  sourceBreakdown: SourceDatum[]
  summary: Kpi02Summary
}

// ---------------------------------------------------------------------------
// Multi-KPI overview — KPI-02 sits inside a wider performance scorecard.
// ---------------------------------------------------------------------------

export type KpiStatus = "success" | "on-target" | "at-risk" | "fail"

export interface KpiOverview {
  code: string
  name: string
  value: string
  unit: string
  status: KpiStatus
  target: string
  progress: number // 0-100
  active?: boolean
}

export const kpiOverview: KpiOverview[] = [
  {
    code: "KPI-01",
    name: "Terminal Cleanliness Audit",
    value: "96.4",
    unit: "%",
    status: "success",
    target: "≥ 95%",
    progress: 96,
  },
  {
    code: "KPI-02",
    name: "Customer Compliments",
    value: "42",
    unit: "events",
    status: "success",
    target: "≥ 1 / period",
    progress: 100,
    active: true,
  },
  {
    code: "KPI-03",
    name: "Complaint Response Time",
    value: "88.1",
    unit: "%",
    status: "on-target",
    target: "≥ 90%",
    progress: 88,
  },
  {
    code: "KPI-04",
    name: "Facility Availability",
    value: "99.2",
    unit: "%",
    status: "success",
    target: "≥ 99%",
    progress: 99,
  },
  {
    code: "KPI-05",
    name: "Waste Diversion Rate",
    value: "71.5",
    unit: "%",
    status: "at-risk",
    target: "≥ 80%",
    progress: 72,
  },
  {
    code: "KPI-06",
    name: "Staff Training Compliance",
    value: "84.0",
    unit: "%",
    status: "on-target",
    target: "≥ 90%",
    progress: 84,
  },
]
