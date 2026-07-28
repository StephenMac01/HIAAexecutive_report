// KPI-08 · Patrol Compliance.
// Calculation: completion rate of scheduled patrols.
// Thresholds:  Fail = 79% or below | Target = 80-90% | Success = 91% or above
// Scoring:     Damage points  -> 20/event 0-39%, 15/event 40-59%, 10/event 60-79%
//              Advantage points -> 15/event 91-95%, 20/event 96-100%
//
// Pure types, scoring rules, and derivation logic.
// SAFE TO IMPORT IN CLIENT COMPONENTS (no filesystem / no xlsx here).
// Live rows are fetched + derived server-side in ./get-data.ts and passed down as props.

export type Band = "Fail" | "Target" | "Success"

// ---- Scoring rules straight from the KPI-08 spec ----
export function getBand(rate: number): Band {
  if (rate <= 79) return "Fail"
  if (rate <= 90) return "Target"
  return "Success"
}

// Positive = advantage points earned, negative = damage points incurred, 0 = neutral (Target band).
export function getPoints(rate: number): number {
  if (rate <= 39) return -20
  if (rate <= 59) return -15
  if (rate <= 79) return -10
  if (rate <= 90) return 0
  if (rate <= 95) return 15
  return 20
}

export const bandMeta: Record<Band, { label: string; color: string; range: string }> = {
  Fail: { label: "Fail", color: "var(--chart-5)", range: "79% or below" },
  Target: { label: "Target", color: "var(--chart-3)", range: "80–90%" },
  Success: { label: "Success", color: "var(--chart-4)", range: "91% or above" },
}

export type RawKpi08Row = {
  "Patrol ID": string
  Date: string
  Month: string
  Site: string
  Scheduled: string | number
  Completed: string | number
  Outcome: string
}

export type TrendPoint = { month: string; rate: number; band: Band; points: number }

export type PatrolSummary = {
  scheduled: number
  completed: number
  missed: number
  complianceRate: number
  previousRate: number
  band: Band
}

export type OutcomeDatum = { outcome: string; count: number; fill: string }

export type SiteRecord = {
  site: string
  scheduled: number
  completed: number
  rate: number
}

export type Kpi08Data = {
  complianceTrend: TrendPoint[]
  patrolSummary: PatrolSummary
  outcomeSplit: OutcomeDatum[]
  siteRecords: SiteRecord[]
}

const round1 = (n: number) => Math.round(n * 10) / 10
const MONTH_ORDER = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const outcomeFill: Record<string, string> = {
  "Completed on time": "var(--color-onTime)",
  "Completed late": "var(--color-late)",
  Missed: "var(--color-missed)",
}

/** Derive every dashboard figure from the raw patrol rows. */
export function deriveKpi08(rows: RawKpi08Row[]): Kpi08Data {
  const patrols = rows.map((r) => ({
    id: String(r["Patrol ID"]),
    date: String(r.Date).slice(0, 10),
    month: String(r.Month),
    site: String(r.Site),
    scheduled: Number(r.Scheduled) || 0,
    completed: Number(r.Completed) || 0,
    outcome: String(r.Outcome),
  }))

  // ---- Headline KPI (whole reporting period = sum of all patrol batches) ----
  const scheduledThisPeriod = patrols.reduce((s, p) => s + p.scheduled, 0)
  const completedThisPeriod = patrols.reduce((s, p) => s + p.completed, 0)
  const currentRate = scheduledThisPeriod ? round1((completedThisPeriod / scheduledThisPeriod) * 100) : 0

  // ---- Monthly compliance trend (%), derived from patrol batches ----
  const complianceTrend: TrendPoint[] = Array.from(new Set(patrols.map((p) => p.month)))
    .sort((a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b))
    .map((month) => {
      const inMonth = patrols.filter((p) => p.month === month)
      const sched = inMonth.reduce((s, p) => s + p.scheduled, 0)
      const comp = inMonth.reduce((s, p) => s + p.completed, 0)
      const rate = sched ? round1((comp / sched) * 100) : 0
      return { month, rate, band: getBand(rate), points: getPoints(rate) }
    })

  const patrolSummary: PatrolSummary = {
    scheduled: scheduledThisPeriod,
    completed: completedThisPeriod,
    missed: scheduledThisPeriod - completedThisPeriod,
    complianceRate: currentRate,
    previousRate: complianceTrend.length >= 2 ? complianceTrend[complianceTrend.length - 2].rate : currentRate,
    band: getBand(currentRate),
  }

  // ---- Patrol outcome split (pie), derived from the Outcome column ----
  const outcomeSplit: OutcomeDatum[] = ["Completed on time", "Completed late", "Missed"].map((outcome) => ({
    outcome,
    count: patrols.filter((p) => p.outcome === outcome).reduce((s, p) => s + p.completed, 0),
    fill: outcomeFill[outcome] ?? "var(--color-onTime)",
  }))

  // ---- Per-site breakdown (table), aggregated from patrol batches ----
  const siteRecords: SiteRecord[] = Object.values(
    patrols.reduce<Record<string, Omit<SiteRecord, "rate">>>((acc, p) => {
      const cur = acc[p.site] ?? { site: p.site, scheduled: 0, completed: 0 }
      cur.scheduled += p.scheduled
      cur.completed += p.completed
      acc[p.site] = cur
      return acc
    }, {}),
  )
    .map((s) => ({ ...s, rate: s.scheduled ? round1((s.completed / s.scheduled) * 100) : 0 }))
    .sort((a, b) => b.rate - a.rate)

  return { complianceTrend, patrolSummary, outcomeSplit, siteRecords }
}
