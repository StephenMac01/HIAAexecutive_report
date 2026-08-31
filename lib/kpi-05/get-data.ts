// KPI-05 — Untrained/Unqualified personnel (server-only live data layer).
// Every visualization is driven by the live Excel workbook (Events + Config
// sheets) sourced from SharePoint, with a local fallback for preview.
import "server-only"
import { getKpiWorkbook } from "@/lib/kpi-data/get-rows"
import { sheetRows, coerceISODate } from "@/lib/xlsx-loader"
import type {
  EventType,
  KpiEvent,
  MonthlyPoint,
  TypeSlice,
  UnitSlice,
  KpiSummary,
} from "@/lib/kpi-05/kpi-types"

type Config = {
  damagePerEvent: number
  thresholdFail: number
  thresholdTarget: number
  reportDate: string
  windowStart: string // "YYYY-MM"
  windowMonths: number
}

export type Kpi05Data = {
  events: KpiEvent[]
  monthly: MonthlyPoint[]
  typeBreakdown: TypeSlice[]
  unitBreakdown: UnitSlice[]
  summary: KpiSummary
  damagePerEvent: number
  thresholdTarget: number
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function buildMonthKeys(config: Config): { key: string; label: string }[] {
  const [startYear, startMonth] = config.windowStart.split("-").map(Number)
  const out: { key: string; label: string }[] = []
  for (let i = 0; i < config.windowMonths; i++) {
    const monthIndex = startMonth - 1 + i
    const year = startYear + Math.floor(monthIndex / 12)
    const month = ((monthIndex % 12) + 12) % 12
    const key = `${year}-${String(month + 1).padStart(2, "0")}`
    out.push({ key, label: MONTH_SHORT[month] })
  }
  return out
}

/** Read the live KPI-05 workbook (Events + Config) and compute all datasets. */
export async function getKpi05Data(): Promise<Kpi05Data> {
  // `cellDates: false` keeps Excel serials/strings raw so coerceISODate can
  // normalize either representation.
  const wb = await getKpiWorkbook("kpi-05", { cellDates: false })

  const eventRows = sheetRows<Record<string, string>>(wb, "Events")
  const events: KpiEvent[] = eventRows.map((r) => ({
    id: String(r.ID),
    date: coerceISODate(r.Date),
    type: r.Type as EventType,
    unit: String(r.Unit),
    personnel: String(r.Personnel),
    post: String(r.Post),
  }))

  const configRows = sheetRows<Record<string, string | number>>(wb, "Config")
  const cfg = new Map<string, string | number>()
  for (const row of configRows) cfg.set(String(row.Key), row.Value)

  const config: Config = {
    damagePerEvent: Number(cfg.get("DamagePerEvent") ?? 25),
    thresholdFail: Number(cfg.get("ThresholdFail") ?? 1),
    thresholdTarget: Number(cfg.get("ThresholdTarget") ?? 0),
    reportDate: String(cfg.get("ReportDate") ?? "2026-07-17"),
    windowStart: String(cfg.get("WindowStart") ?? "2025-08"),
    windowMonths: Number(cfg.get("WindowMonths") ?? 12),
  }

  const DAMAGE_PER_EVENT = config.damagePerEvent
  const MONTHS = buildMonthKeys(config)

  let cumulative = 0
  const monthly: MonthlyPoint[] = MONTHS.map(({ key, label }) => {
    const monthEvents = events.filter((e) => e.date.startsWith(key))
    const untrained = monthEvents.filter((e) => e.type === "Untrained working").length
    const unqualified = monthEvents.filter((e) => e.type === "Unqualified filling post").length
    const count = monthEvents.length
    const damage = count * DAMAGE_PER_EVENT
    cumulative += damage
    return { month: label, untrained, unqualified, events: count, damage, cumulativeDamage: cumulative }
  })

  const typeBreakdown: TypeSlice[] = [
    {
      type: "Untrained working",
      key: "untrained",
      count: events.filter((e) => e.type === "Untrained working").length,
    },
    {
      type: "Unqualified filling post",
      key: "unqualified",
      count: events.filter((e) => e.type === "Unqualified filling post").length,
    },
  ]

  const unitMap = new Map<string, number>()
  for (const e of events) unitMap.set(e.unit, (unitMap.get(e.unit) ?? 0) + 1)
  const unitBreakdown: UnitSlice[] = [...unitMap.entries()]
    .map(([unit, count]) => ({ unit, count, damage: count * DAMAGE_PER_EVENT }))
    .sort((a, b) => b.count - a.count)

  const today = new Date(config.reportDate)
  const totalEvents = events.length
  const sorted = [...events].sort((a, b) => (a.date < b.date ? 1 : -1))
  const lastEventDate = sorted.length ? new Date(sorted[0].date) : today
  const daysSinceLastEvent = Math.round(
    (today.getTime() - lastEventDate.getTime()) / (1000 * 60 * 60 * 24),
  )
  const summary: KpiSummary = {
    totalEvents,
    damagePoints: totalEvents * DAMAGE_PER_EVENT,
    target: config.thresholdTarget,
    status: totalEvents >= config.thresholdFail ? "Fail" : "Target met",
    currentMonthEvents: monthly[monthly.length - 1]?.events ?? 0,
    previousMonthEvents: monthly[monthly.length - 2]?.events ?? 0,
    daysSinceLastEvent,
    worstUnit: unitBreakdown[0]?.unit ?? "—",
  }

  return {
    events,
    monthly,
    typeBreakdown,
    unitBreakdown,
    summary,
    damagePerEvent: DAMAGE_PER_EVENT,
    thresholdTarget: config.thresholdTarget,
  }
}
