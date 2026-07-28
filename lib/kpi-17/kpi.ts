import "server-only"
import { getKpiSheetRows } from "@/lib/kpi-data/get-rows"

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

const MONTH_ORDER = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export async function getKpiData(): Promise<KpiData> {
  const raw = await getKpiSheetRows<Record<string, unknown>>("kpi-17", "Events")

  const events: SafetyEvent[] = raw.map((r) => ({
    id: String(r["Event ID"]),
    date: String(r["Date"]),
    week: String(r["Reporting Week"] ?? ""),
    weekEnding: String(r["Week Ending"] ?? ""),
    month: String(r["Month"]),
    element: String(r["Safety Element"]),
    description: String(r["Description"]),
    location: String(r["Location"]),
    severity: String(r["Severity"]) as SafetyEvent["severity"],
    reportedBy: String(r["Reported By"]),
    status: String(r["Status"]) as SafetyEvent["status"],
    correctiveAction: String(r["Corrective Action"] ?? ""),
    damagePoints: Number(r["Damage Points"]) || DAMAGE_PER_EVENT,
  }))

  const totalEvents = events.length
  const totalDamage = events.reduce((s, e) => s + e.damagePoints, 0)
  const openEvents = events.filter((e) => e.status === "Open").length
  const closedEvents = totalEvents - openEvents

  const monthly: MonthPoint[] = MONTH_ORDER.map((m) => {
    const monthEvents = events.filter((e) => e.month === m)
    return {
      month: m,
      events: monthEvents.length,
      damage: monthEvents.reduce((s, e) => s + e.damagePoints, 0),
    }
  })

  const monthsMetTarget = monthly.filter((m) => m.events === 0).length
  const monthsReported = monthly.length

  const byElement: NamedCount[] = Object.entries(
    events.reduce<Record<string, number>>((acc, e) => {
      acc[e.element] = (acc[e.element] ?? 0) + 1
      return acc
    }, {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const severityOrder = ["High", "Medium", "Low"]
  const bySeverity: NamedCount[] = severityOrder.map((name) => ({
    name,
    value: events.filter((e) => e.severity === name).length,
  }))

  return {
    events: [...events].sort((a, b) => (a.date < b.date ? 1 : -1)),
    totalEvents,
    totalDamage,
    openEvents,
    closedEvents,
    monthsMetTarget,
    monthsReported,
    resultVsTarget: totalEvents === 0 ? "Target Met" : "Fail",
    monthly,
    byElement,
    bySeverity,
  }
}
