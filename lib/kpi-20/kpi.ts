// Client-safe types and pure aggregation helpers.
// No filesystem / xlsx imports here so this can be used from client components.

export type ShiftRow = {
  id: number
  week: string
  weekStarting: string
  date: string
  shift: "Day" | "Night"
  team: string
  driversOnShift: number
  minimumRequired: number
  meetsRequirement: "Yes" | "No"
  event: number
  damagePoints: number
}

export type WeeklyPoint = { week: string; events: number; damagePoints: number; shifts: number }
export type DistributionPoint = { count: string; shifts: number; belowMinimum: boolean }
export type ShiftTypePoint = { shift: string; events: number }

export type Threshold = { fail: number; target: number; success: string }

export type Totals = {
  totalShifts: number
  totalEvents: number
  totalDamagePoints: number
  compliantShifts: number
}

export type ThresholdStatus = "Target Met" | "Fail"

export type Dashboard = {
  kpi: string
  title: string
  minimumRequired: number
  damagePerEvent: number
  threshold: Threshold
  totals: Totals
  complianceRate: number
  status: ThresholdStatus
  weeklyTrend: WeeklyPoint[]
  driverDistribution: DistributionPoint[]
  eventsByShift: ShiftTypePoint[]
  eventRows: ShiftRow[]
  dateRange: { start?: string; end?: string }
}

export const MIN_REQUIRED = 2
export const DAMAGE_PER_EVENT = 5

// Build the full dashboard model from raw shift rows.
export function computeDashboard(rows: ShiftRow[]): Dashboard {
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date) || a.shift.localeCompare(b.shift))

  const totalEvents = sorted.reduce((s, r) => s + r.event, 0)
  const totalDamagePoints = sorted.reduce((s, r) => s + r.damagePoints, 0)
  const totalShifts = sorted.length
  const compliantShifts = totalShifts - totalEvents

  const threshold: Threshold = { fail: 1, target: 0, success: "n/a" }
  const status: ThresholdStatus = totalEvents >= threshold.fail ? "Fail" : "Target Met"

  // Weekly trend
  const weekMap = new Map<string, WeeklyPoint>()
  for (const r of sorted) {
    const existing = weekMap.get(r.week) ?? { week: r.week, events: 0, damagePoints: 0, shifts: 0 }
    existing.events += r.event
    existing.damagePoints += r.damagePoints
    existing.shifts += 1
    weekMap.set(r.week, existing)
  }
  const weeklyTrend = Array.from(weekMap.values()).sort((a, b) => a.week.localeCompare(b.week))

  // Distribution of D drivers per shift
  const counts = new Map<number, number>()
  for (const r of sorted) counts.set(r.driversOnShift, (counts.get(r.driversOnShift) ?? 0) + 1)
  const maxDrivers = sorted.length ? Math.max(...sorted.map((r) => r.driversOnShift)) : 0
  const driverDistribution: DistributionPoint[] = []
  for (let i = 0; i <= maxDrivers; i++) {
    driverDistribution.push({
      count: `${i}`,
      shifts: counts.get(i) ?? 0,
      belowMinimum: i < MIN_REQUIRED,
    })
  }

  // Events by shift type
  const byShift = { Day: 0, Night: 0 }
  for (const r of sorted) if (r.event) byShift[r.shift] += 1
  const eventsByShift: ShiftTypePoint[] = [
    { shift: "Day", events: byShift.Day },
    { shift: "Night", events: byShift.Night },
  ]

  const eventRows = sorted
    .filter((r) => r.event === 1)
    .sort((a, b) => b.date.localeCompare(a.date))

  return {
    kpi: "KPI-20",
    title: "AVOP DA & D Drivers",
    minimumRequired: MIN_REQUIRED,
    damagePerEvent: DAMAGE_PER_EVENT,
    threshold,
    totals: { totalShifts, totalEvents, totalDamagePoints, compliantShifts },
    complianceRate: totalShifts === 0 ? 100 : (compliantShifts / totalShifts) * 100,
    status,
    weeklyTrend,
    driverDistribution,
    eventsByShift,
    eventRows,
    dateRange: { start: sorted[0]?.date, end: sorted[sorted.length - 1]?.date },
  }
}
