import "server-only"
import { sheetRows } from "@/lib/xlsx-loader"
import { getKpiWorkbook } from "@/lib/kpi-data/get-rows"
import {
  DAMAGE_POINTS_PER_EVENT,
  FAIL_THRESHOLD,
  TARGET,
  type EventStatus,
  type EventType,
  type FleetStatus,
  type FleetVehicle,
  type KpiData,
  type VehicleEvent,
  type WeeklyPoint,
} from "./kpi-data"

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export async function getKpiData(): Promise<KpiData> {
  // `cellDates: false` keeps date cells as their raw strings, matching the
  // downstream string handling in this loader.
  const wb = await getKpiWorkbook("kpi-15", { cellDates: false })

  const rawEvents = sheetRows<Record<string, string | number>>(wb, "Events", {})
  const rawFleet = sheetRows<Record<string, string | number>>(wb, "Fleet", {})

  const events: VehicleEvent[] = rawEvents.map((r) => ({
    eventId: String(r["Event ID"]),
    weekEnding: String(r["Week Ending"]),
    date: String(r["Incident Date"] ?? r["Date"]),
    vehicleId: String(r["Vehicle ID"]),
    eventType: String(r["Event Type"]) as EventType,
    description: String(r["Description"]),
    location: String(r["Location"]),
    reportedBy: String(r["Reported By"]),
    status: String(r["Status"]) as EventStatus,
    damagePoints: Number(r["Damage Points"]) || DAMAGE_POINTS_PER_EVENT,
  }))

  const fleet: FleetVehicle[] = rawFleet.map((r) => ({
    vehicleId: String(r["Vehicle ID"]),
    type: String(r["Type"]),
    makeModel: String(r["Make / Model"]),
    year: Number(r["Year"]),
    status: String(r["Status"]) as FleetStatus,
    lastInspection: String(r["Last Inspection"]),
  }))

  // Build a continuous WEEKLY series across the range present in the data.
  // Weeks are keyed by their "Week Ending" (Friday) date, stepping 7 days.
  const weekDates = events
    .map((e) => new Date(`${e.weekEnding}T00:00:00`))
    .filter((d) => !Number.isNaN(d.getTime()))
  const minWeek = weekDates.length ? new Date(Math.min(...weekDates.map((d) => d.getTime()))) : new Date()
  const maxWeek = weekDates.length ? new Date(Math.max(...weekDates.map((d) => d.getTime()))) : new Date()

  const weekly: WeeklyPoint[] = []
  const cursor = new Date(minWeek)
  while (cursor <= maxWeek) {
    const key = toISODate(cursor)
    const weekEvents = events.filter((e) => e.weekEnding === key)
    weekly.push({
      weekEnding: key,
      label: `${MONTH_LABELS[cursor.getMonth()]} ${cursor.getDate()}`,
      events: weekEvents.length,
      damagePoints: weekEvents.reduce((sum, e) => sum + e.damagePoints, 0),
      target: TARGET,
      fail: FAIL_THRESHOLD,
    })
    cursor.setDate(cursor.getDate() + 7)
  }

  const missingRequirement = events.filter((e) => e.eventType === "Missing Requirement").length
  const removedWithoutReplacement = events.filter((e) => e.eventType === "Removed Without Replacement").length
  const openEvents = events.filter((e) => e.status === "Open").length

  const current = weekly[weekly.length - 1]

  const compliant = fleet.filter((f) => f.status === "Compliant").length
  const nonCompliant = fleet.filter((f) => f.status === "Non-Compliant").length
  const removed = fleet.filter((f) => f.status === "Removed").length

  return {
    events: [...events].sort((a, b) => (a.date < b.date ? 1 : -1)),
    fleet,
    weekly,
    totals: {
      events: events.length,
      damagePoints: events.reduce((sum, e) => sum + e.damagePoints, 0),
      openEvents,
      missingRequirement,
      removedWithoutReplacement,
      currentPeriodEvents: current?.events ?? 0,
      currentPeriodLabel: current?.label ?? "",
      currentPeriodStatus: (current?.events ?? 0) >= FAIL_THRESHOLD ? "Fail" : "Pass",
    },
    fleetStats: {
      total: fleet.length,
      compliant,
      nonCompliant,
      removed,
      complianceRate: fleet.length ? Math.round((compliant / fleet.length) * 100) : 0,
    },
    breakdown: [
      { name: "Missing Requirement", value: missingRequirement },
      { name: "Removed Without Replacement", value: removedWithoutReplacement },
    ],
  }
}
