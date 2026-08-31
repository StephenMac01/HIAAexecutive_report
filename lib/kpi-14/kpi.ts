export const KPI = {
  id: "KPI-14",
  name: "Document Changes",
  calculation:
    "The Contractor may not make changes to any HIAA provided documents or training without prior written consent of HIAA. Documents, training, changed without written approval will count as one (1) event.",
  fail: 1,
  target: 0,
  success: "n/a",
  damagePerEvent: 20,
  advantagePoints: "n/a",
} as const

export type ApprovalStatus = "Approved" | "Unauthorized" | "Pending"
export type ChangeType = "Document" | "Training"

export interface ChangeEvent {
  id: string
  weekEnding: string
  date: string
  item: string
  type: ChangeType
  description: string
  requestedBy: string
  status: ApprovalStatus
  reviewedBy: string
  consentDate: string
  damagePoints: number
  notes: string
}

export interface KpiSummary {
  total: number
  approved: number
  unauthorized: number
  pending: number
  damagePoints: number
  status: "Target Met" | "Fail"
  passing: boolean
}

/** Map a raw worksheet row (array-of-arrays) to a typed ChangeEvent. */
export function rowToEvent(row: unknown[]): ChangeEvent {
  return {
    id: String(row[0] ?? ""),
    weekEnding: String(row[1] ?? ""),
    date: String(row[2] ?? ""),
    item: String(row[3] ?? ""),
    type: (String(row[4] ?? "Document") as ChangeType) || "Document",
    description: String(row[5] ?? ""),
    requestedBy: String(row[6] ?? ""),
    status: (String(row[7] ?? "Pending") as ApprovalStatus) || "Pending",
    reviewedBy: String(row[8] ?? ""),
    consentDate: String(row[9] ?? ""),
    damagePoints: Number(row[10] ?? 0),
    notes: String(row[11] ?? ""),
  }
}

export function summarize(events: ChangeEvent[]): KpiSummary {
  const unauthorized = events.filter((e) => e.status === "Unauthorized").length
  const approved = events.filter((e) => e.status === "Approved").length
  const pending = events.filter((e) => e.status === "Pending").length
  const damagePoints = events.reduce((sum, e) => sum + (e.damagePoints || 0), 0)
  const passing = unauthorized <= KPI.target
  return {
    total: events.length,
    approved,
    unauthorized,
    pending,
    damagePoints,
    status: passing ? "Target Met" : "Fail",
    passing,
  }
}

export interface MonthlyPoint {
  month: string
  unauthorized: number
  approved: number
  damage: number
}

/** Group events by YYYY-MM for the trend chart. */
export function byMonth(events: ChangeEvent[]): MonthlyPoint[] {
  const map = new Map<string, MonthlyPoint>()
  for (const e of events) {
    const key = e.date.slice(0, 7)
    if (!key) continue
    const label = new Date(e.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
    })
    const point = map.get(key) ?? { month: label, unauthorized: 0, approved: 0, damage: 0 }
    if (e.status === "Unauthorized") point.unauthorized += 1
    if (e.status === "Approved") point.approved += 1
    point.damage += e.damagePoints || 0
    map.set(key, point)
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v)
}
