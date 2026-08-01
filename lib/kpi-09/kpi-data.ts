// KPI-9 "Timeliness" data model — powered by an Excel workbook.
//
// Definition (from the performance framework):
// - A material failure to deliver reports/documents on the required timeline
//   counts as one (1) event.
// - Damage points: 10 per event. Advantage points: n/a.
// - Threshold: Fail = 1, Target = 0, Success = n/a.
//
// Pure types, constants, and derivation logic.
// SAFE TO IMPORT IN CLIENT COMPONENTS (no filesystem / no xlsx here).
// Live rows are fetched server-side in ./get-data.ts and derived here.

export const DAMAGE_POINTS_PER_EVENT = 10
// Public download path for the workbook (mirrored under /public/kpi-09/).
export const DATA_FILE = "kpi-09/kpi-09.xlsx"

export type DeliveryStatus = "on-time" | "late" | "pending"

export type Deliverable = {
  reportingWeek: string
  id: string
  name: string
  category: string
  dueDate: string
  deliveredDate: string | null
  status: DeliveryStatus
  daysLate: number
  isEvent: boolean
  damagePoints: number
  note?: string
}

export type MonthlySummary = {
  month: string
  events: number
  damagePoints: number
  onTime: number
}

export type KpiThreshold = "Fail" | "Target"

export type TimelinessData = {
  deliverables: Deliverable[] // rows for the current period (latest month)
  allDeliverables: Deliverable[]
  monthlyTrend: MonthlySummary[]
  period: {
    label: string
    events: number
    damagePoints: number
    onTime: number
    delivered: number
    total: number
    onTimeRate: number
    status: KpiThreshold
  }
  ytd: {
    events: number
    damagePoints: number
    onTimePeriods: number
    periods: number
  }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function toIso(value: unknown): string | null {
  if (value == null || value === "") return null
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  const s = String(value).trim()
  if (!s) return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? s : d.toISOString().slice(0, 10)
}

function normalizeStatus(raw: string, deliveredDate: string | null): DeliveryStatus {
  const s = raw.toLowerCase()
  if (s.includes("pending") || !deliveredDate) return "pending"
  if (s.includes("late")) return "late"
  return "on-time"
}

/** Map raw workbook JSON rows into typed deliverables. */
export function parseRows(raw: Record<string, unknown>[]): Deliverable[] {
  return raw
    .map((r) => {
      const deliveredDate = toIso(r["Delivered Date"])
      const status = normalizeStatus(String(r["Status"] ?? ""), deliveredDate)
      const isEvent = String(r["Event"] ?? "").trim().toLowerCase() === "yes"
      const damageRaw = Number(r["Damage Points"])
      return {
        reportingWeek: toIso(r["Reporting Week"]) ?? "",
        id: String(r["Deliverable ID"] ?? "").trim(),
        name: String(r["Deliverable Name"] ?? "").trim(),
        category: String(r["Category"] ?? "").trim(),
        dueDate: toIso(r["Due Date"]) ?? "",
        deliveredDate,
        status,
        daysLate: Number(r["Days Late"]) || 0,
        isEvent,
        damagePoints: Number.isFinite(damageRaw) ? damageRaw : isEvent ? DAMAGE_POINTS_PER_EVENT : 0,
        note: String(r["Notes"] ?? "").trim() || undefined,
      } satisfies Deliverable
    })
    .filter((d) => d.id)
}

function buildMonthlyTrend(rows: Deliverable[]): MonthlySummary[] {
  const byMonth = new Map<number, MonthlySummary>()
  for (const d of rows) {
    if (!d.dueDate) continue
    const m = new Date(d.dueDate).getUTCMonth()
    const entry = byMonth.get(m) ?? { month: MONTHS[m], events: 0, damagePoints: 0, onTime: 0 }
    if (d.isEvent) {
      entry.events += 1
      entry.damagePoints += d.damagePoints
    }
    if (d.status === "on-time") entry.onTime += 1
    byMonth.set(m, entry)
  }
  return [...byMonth.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v)
}

/** Derive the full timeliness dataset from raw workbook JSON rows. */
export function deriveTimeliness(raw: Record<string, unknown>[]): TimelinessData {
  const allDeliverables = parseRows(raw)
  const monthlyTrend = buildMonthlyTrend(allDeliverables)

  // Current period = the most recent reporting month present in the sheet.
  const latestMonth = allDeliverables.reduce((max, d) => {
    if (!d.dueDate) return max
    const t = new Date(d.dueDate).getTime()
    return t > max ? t : max
  }, 0)
  const latestKey = latestMonth ? new Date(latestMonth).getUTCMonth() : new Date().getUTCMonth()
  const latestYear = latestMonth ? new Date(latestMonth).getUTCFullYear() : new Date().getUTCFullYear()

  const deliverables = allDeliverables.filter((d) => {
    if (!d.dueDate) return false
    const dt = new Date(d.dueDate)
    return dt.getUTCMonth() === latestKey && dt.getUTCFullYear() === latestYear
  })

  const events = deliverables.filter((d) => d.isEvent).length
  const delivered = deliverables.filter((d) => d.status !== "pending")
  const onTime = delivered.filter((d) => d.status === "on-time").length
  const damagePoints = deliverables.reduce((s, d) => s + (d.isEvent ? d.damagePoints : 0), 0)

  const ytd = {
    events: allDeliverables.filter((d) => d.isEvent).length,
    damagePoints: allDeliverables.reduce((s, d) => s + (d.isEvent ? d.damagePoints : 0), 0),
    onTimePeriods: monthlyTrend.filter((m) => m.events === 0).length,
    periods: monthlyTrend.length,
  }

  return {
    deliverables,
    allDeliverables,
    monthlyTrend,
    period: {
      label: `${MONTHS[latestKey]} ${latestYear}`,
      events,
      damagePoints,
      onTime,
      delivered: delivered.length,
      total: deliverables.length,
      onTimeRate: delivered.length ? Math.round((onTime / delivered.length) * 100) : 0,
      status: events >= 1 ? "Fail" : "Target",
    },
    ytd,
  }
}
