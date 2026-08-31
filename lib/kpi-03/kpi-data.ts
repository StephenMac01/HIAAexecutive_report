// KPI-03 · Absent Post / Staffing — client-safe module (types, constants,
// no file/SharePoint access). Live data derivations live in ./get-data.ts.
// Calculation: Minimum staffing level requirements as provided by HIAA. The number
// of occurrences where staffing level is below the minimum staffing level is counted
// as one (1). Threshold: Fail = 1, Target = 0. Damage points = 10 per event.

export const KPI_META = {
  id: "KPI-03",
  name: "Absent Post / Staffing",
  calculation:
    "Minimum staffing level requirements as provided by HIAA from time to time during the term of this Agreement. The number of occurrences where staffing level is below the minimum staffing level is counted as one (1).",
  threshold: { fail: 1, target: 0, success: "n/a" as const },
  damagePointsPerEvent: 10,
  excusingEvent: "Not Applicable.",
  minimumStaffing: 12,
  reportingPeriod: "FY 2025 · Rolling 12 months",
}

export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

export type MonthlyPoint = {
  month: string
  occurrences: number
  target: number
  damagePoints: number
  avgStaffing: number
  minStaffing: number
}

export type ShiftBreakdown = { shift: string; occurrences: number }

export type Occurrence = {
  id: string
  date: string
  shift: string
  post: string
  required: number
  actual: number
  duration: string
  damagePoints: number
}

export type Kpi03Summary = {
  totalOccurrences: number
  totalDamagePoints: number
  compliantMonths: number
  totalMonths: number
  worstMonth: MonthlyPoint
}

export interface Kpi03Data {
  occurrences: Occurrence[]
  monthly: MonthlyPoint[]
  byShift: ShiftBreakdown[]
  summary: Kpi03Summary
}
