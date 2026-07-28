// KPI-04 — Unreported absent posts (client-safe module).
// Types, constants and labels only — NO file/SharePoint access — so client
// components can import freely. Live derivations live in ./get-data.ts.

export const KPI = {
  id: "KPI-04",
  name: "Unreported Absent Posts",
  damagePointsPerEvent: 10,
  reportSlaMinutes: 5,
  noticeRequiredHours: 24,
  threshold: {
    fail: 1, // >= 1 event in the period = Fail
    target: 0,
    success: 0,
  },
} as const

export type EventType = "no-show-late-report" | "no-advance-notice"

export type AbsentPostEvent = {
  id: string
  date: string // ISO date (shift date)
  time: string // local time of shift
  zone: string
  post: string
  type: EventType
  reportMinutes?: number // Late-report events: minutes to notify HIAA (SLA = 5)
  noticeHours?: number // Advance-notice events: hours of notice given (required >= 24)
  reportedToHiaa: boolean
  missingStaff: number
  damagePoints: number
  week: string
  detail: string
}

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  "no-show-late-report": "No-show not reported within 5 min",
  "no-advance-notice": "No 24-hour advance shortage notice",
}

export type MonthlyPoint = {
  month: string
  key: string // YYYY-MM for sorting
  lateReport: number
  noNotice: number
}

export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

export type DashboardData = {
  events: AbsentPostEvent[]
  monthlySeries: MonthlyPoint[]
  eventLog: AbsentPostEvent[]
  currentPeriod: { label: string; key: string; events: AbsentPostEvent[] }
  typeBreakdown: { key: string; label: string; value: number }[]
  ytdEvents: number
  ytdDamagePoints: number
  currentEventCount: number
  currentDamagePoints: number
  isCurrentPeriodPass: boolean
  compliantMonths: number
  complianceRate: number
  totalRows: number
}
