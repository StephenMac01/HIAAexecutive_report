export const DAMAGE_PER_EVENT = 25
export const FILE_NAME = "kpi-17-contractor-safety-plan.xlsx"

export type SafetyEvent = {
  id: string
  date: string
  week: string
  weekEnding: string
  month: string
  element: string
  description: string
  location: string
  severity: "Low" | "Medium" | "High"
  reportedBy: string
  status: "Open" | "Closed"
  correctiveAction: string
  damagePoints: number
}

export type MonthPoint = {
  month: string
  events: number
  damage: number
}

export type NamedCount = { name: string; value: number }

export type KpiData = {
  events: SafetyEvent[]
  totalEvents: number
  totalDamage: number
  openEvents: number
  closedEvents: number
  monthsMetTarget: number
  monthsReported: number
  resultVsTarget: "Fail" | "Target Met"
  monthly: MonthPoint[]
  byElement: NamedCount[]
  bySeverity: NamedCount[]
}

