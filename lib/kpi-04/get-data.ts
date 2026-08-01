import "server-only"
import { getKpiSheetRows } from "@/lib/kpi-data/get-rows"
import {
  EVENT_TYPE_LABEL,
  KPI,
  MONTH_LABELS,
  type AbsentPostEvent,
  type DashboardData,
  type EventType,
  type MonthlyPoint,
} from "@/lib/kpi-04/kpi-data"

// ---- Raw Excel row shape ---------------------------------------------------
type RawRow = {
  "Event ID"?: string
  "Shift Date"?: string | number | Date
  "Shift Time"?: string
  "Terminal/Zone"?: string
  Post?: string
  "Event Type"?: string
  "Missing Staff"?: number
  "Report Minutes"?: number | string
  "Notice Hours"?: number | string
  "Reported To HIAA"?: string
  "Damage Points"?: number
  "Reporting Week"?: string
  Notes?: string
}

function toEventType(raw?: string): EventType {
  return (raw ?? "").toLowerCase().includes("notice") ? "no-advance-notice" : "no-show-late-report"
}

function num(v: number | string | undefined): number | undefined {
  if (v === undefined || v === "" || v === null) return undefined
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? n : undefined
}

async function loadEvents(): Promise<AbsentPostEvent[]> {
  const rows = await getKpiSheetRows<RawRow>("kpi-04", "Events")

  return rows
    .map((r): AbsentPostEvent => {
      const type = toEventType(r["Event Type"])
      const rawDate: unknown = r["Shift Date"]
      const date =
        rawDate instanceof Date ? rawDate.toISOString().slice(0, 10) : String(rawDate ?? "").slice(0, 10)
      return {
        id: String(r["Event ID"] ?? ""),
        date,
        time: String(r["Shift Time"] ?? ""),
        zone: String(r["Terminal/Zone"] ?? ""),
        post: String(r["Post"] ?? ""),
        type,
        reportMinutes: type === "no-show-late-report" ? num(r["Report Minutes"]) : undefined,
        noticeHours: type === "no-advance-notice" ? num(r["Notice Hours"]) : undefined,
        reportedToHiaa: String(r["Reported To HIAA"] ?? "").toLowerCase() === "yes",
        missingStaff: num(r["Missing Staff"]) ?? 0,
        damagePoints: num(r["Damage Points"]) ?? KPI.damagePointsPerEvent,
        week: String(r["Reporting Week"] ?? ""),
        detail: String(r["Notes"] ?? ""),
      }
    })
    .filter((e) => e.date)
    .sort((a, b) => b.date.localeCompare(a.date)) // newest first
}

/** Read the live KPI-04 workbook and compute the full dashboard dataset. */
export async function getDashboardData(): Promise<DashboardData> {
  const events = await loadEvents()

  // Group into the trailing 12 months ending at the latest event.
  const buckets = new Map<string, MonthlyPoint>()
  for (const e of events) {
    const key = e.date.slice(0, 7) // YYYY-MM
    const monthIdx = Number(key.slice(5, 7)) - 1
    if (!buckets.has(key)) {
      buckets.set(key, { month: MONTH_LABELS[monthIdx] ?? key, key, lateReport: 0, noNotice: 0 })
    }
    const b = buckets.get(key)!
    if (e.type === "no-show-late-report") b.lateReport += 1
    else b.noNotice += 1
  }
  const monthlySeries = [...buckets.values()].sort((a, b) => a.key.localeCompare(b.key)).slice(-12)

  const latestKey = monthlySeries.length ? monthlySeries[monthlySeries.length - 1].key : ""
  const currentEvents = events.filter((e) => e.date.slice(0, 7) === latestKey)
  const currentLabel = latestKey
    ? `${MONTH_LABELS[Number(latestKey.slice(5, 7)) - 1]} ${latestKey.slice(0, 4)}`
    : "—"

  const ytdEvents = events.length
  const ytdDamagePoints = events.reduce((s, e) => s + e.damagePoints, 0)
  const currentEventCount = currentEvents.length
  const currentDamagePoints = currentEvents.reduce((s, e) => s + e.damagePoints, 0)

  const compliantMonths = monthlySeries.filter((p) => p.lateReport + p.noNotice === 0).length
  const complianceRate = monthlySeries.length
    ? Math.round((compliantMonths / monthlySeries.length) * 100)
    : 100

  const typeBreakdown = [
    {
      key: "lateReport",
      label: EVENT_TYPE_LABEL["no-show-late-report"],
      value: events.filter((e) => e.type === "no-show-late-report").length,
    },
    {
      key: "noNotice",
      label: EVENT_TYPE_LABEL["no-advance-notice"],
      value: events.filter((e) => e.type === "no-advance-notice").length,
    },
  ]

  return {
    events,
    monthlySeries,
    eventLog: events.slice(0, 12),
    currentPeriod: { label: currentLabel, key: latestKey, events: currentEvents },
    typeBreakdown,
    ytdEvents,
    ytdDamagePoints,
    currentEventCount,
    currentDamagePoints,
    isCurrentPeriodPass: currentEventCount <= KPI.threshold.target,
    compliantMonths,
    complianceRate,
    totalRows: events.length,
  }
}
