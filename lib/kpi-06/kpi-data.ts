// KPI-06 — Invoicing
// Pure types, scoring constants, and derivation logic.
// SAFE TO IMPORT IN CLIENT COMPONENTS (no filesystem / no xlsx here).
// The actual data is parsed from data/kpi-06-invoicing.xlsx by lib/kpi-loader.ts
// (server-only) and passed down from the page as props.

export const KPI = {
  id: "KPI-06",
  name: "Invoicing",
  target: 0,
  failThreshold: 1,
  damagePerEvent: 2,
} as const

// One row per week — mirrors the "Weekly Invoicing Log" sheet in the workbook.
export type WeekRecord = {
  weekEnding: string // ISO date, e.g. "2026-02-20"
  label: string // short axis label, e.g. "Feb 20"
  period: string // full label, e.g. "Week ending Feb 20, 2026"
  invoices: number // total invoices submitted that week
  late: number // submitted late -> each is 1 event
  incorrect: number // flagged incorrect
  rectifiedInTime: number // incorrect fixed within 30 days (no event)
  notRectified: number // incorrect NOT fixed within 30 days -> each is 1 event
  notes: string
}

export type WeekDerived = WeekRecord & {
  events: number
  damagePoints: number
  onTime: number
  onTimeRate: number
  accurate: number
  accuracyRate: number
  status: "target" | "fail"
}

export function derive(w: WeekRecord): WeekDerived {
  const events = w.late + w.notRectified
  const onTime = w.invoices - w.late
  const accurate = w.invoices - w.incorrect
  return {
    ...w,
    events,
    damagePoints: events * KPI.damagePerEvent,
    onTime,
    onTimeRate: w.invoices ? (onTime / w.invoices) * 100 : 100,
    accurate,
    accuracyRate: w.invoices ? (accurate / w.invoices) * 100 : 100,
    status: events >= KPI.failThreshold ? "fail" : "target",
  }
}

export type OpenInvoice = {
  id: string
  vendor: string
  submitted: string
  amount: number
  issue: string
  daysOpen: number // days since flagged incorrect
}

export type Totals = {
  invoices: number
  late: number
  incorrect: number
  notRectified: number
  events: number
  damagePoints: number
  onTime: number
  accurate: number
}

// Everything the dashboard needs, computed once server-side and passed as props.
export type KpiDataset = {
  weeks: WeekDerived[]
  current: WeekDerived
  previous: WeekDerived
  totals: Totals
  totalOnTimeRate: number
  totalAccuracyRate: number
  cleanWeeks: number
  openInvoices: OpenInvoice[]
}

export function buildDataset(records: WeekRecord[], openInvoices: OpenInvoice[]): KpiDataset {
  const weeks = records.map(derive)
  const totals = weeks.reduce<Totals>(
    (acc, w) => {
      acc.invoices += w.invoices
      acc.late += w.late
      acc.incorrect += w.incorrect
      acc.notRectified += w.notRectified
      acc.events += w.events
      acc.damagePoints += w.damagePoints
      acc.onTime += w.onTime
      acc.accurate += w.accurate
      return acc
    },
    { invoices: 0, late: 0, incorrect: 0, notRectified: 0, events: 0, damagePoints: 0, onTime: 0, accurate: 0 },
  )

  return {
    weeks,
    current: weeks[weeks.length - 1],
    previous: weeks[weeks.length - 2] ?? weeks[weeks.length - 1],
    totals,
    totalOnTimeRate: totals.invoices ? (totals.onTime / totals.invoices) * 100 : 100,
    totalAccuracyRate: totals.invoices ? (totals.accurate / totals.invoices) * 100 : 100,
    cleanWeeks: weeks.filter((w) => w.events === 0).length,
    openInvoices,
  }
}

export function riskLevel(daysOpen: number): "critical" | "warning" | "ok" {
  const remaining = 30 - daysOpen
  if (remaining <= 5) return "critical"
  if (remaining <= 14) return "warning"
  return "ok"
}
