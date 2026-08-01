// KPI-11 — HIAA Security Aviation Security Directive
//
// Pure types, constants, and derivation logic.
// SAFE TO IMPORT IN CLIENT COMPONENTS (no filesystem / no xlsx here).
// Live audit rows are fetched server-side in ./get-data.ts and derived here.

export const kpiSpec = {
  id: "KPI-11",
  title: "HIAA Security Aviation Security Directive",
  calculation:
    "The Contractor, or one of its employees, is responsible for non-compliance with a HIAA Security Aviation Security Directive. Each incident will count as one (1) event.",
  threshold: {
    fail: 1,
    target: 0,
    success: "n/a",
  },
  damagePointsPerEvent: 10,
  advantagePoints: "n/a",
} as const

export type Audit = {
  id: string
  date: string
  period: string
  directive: string
  post: string
  result: string
  damagePoints: number
}

export type MonthlyRecord = {
  period: string // e.g. "Apr 2025"
  directivesAudited: number
  events: number // non-compliance events
  damagePoints: number
  cumulativeDamagePoints: number
  status: "Target Met" | "Fail"
}

export type Summary = {
  totalEvents: number
  totalDamagePoints: number
  totalDirectivesAudited: number
  monthsReported: number
  monthsAtTarget: number
  complianceRate: number
  complianceStreak: number
}

export type Kpi11Data = {
  audits: Audit[]
  monthlyData: MonthlyRecord[]
  summary: Summary
}

export type RawKpi11Row = {
  "Audit ID": string
  Date: string
  Period: string
  Directive: string
  Post: string
  Result: string
  "Damage Points": string | number
}

const MONTH_ORDER = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** Derive audits, monthly rollups, and summary figures from raw workbook rows. */
export function deriveKpi11(rows: RawKpi11Row[]): Kpi11Data {
  // Raw audit records — each row is one directive audit at a post.
  const audits: Audit[] = rows.map((r) => ({
    id: String(r["Audit ID"]),
    date: String(r.Date).slice(0, 10),
    period: String(r.Period),
    directive: String(r.Directive),
    post: String(r.Post),
    result: String(r.Result),
    damagePoints: Number(r["Damage Points"]) || 0,
  }))

  // Monthly rollup: an "event" = a non-compliant audit.
  const monthlyData: MonthlyRecord[] = Array.from(new Set(audits.map((a) => a.period)))
    .sort((a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b))
    .map((period) => {
      const inPeriod = audits.filter((a) => a.period === period)
      const events = inPeriod.filter((a) => a.result.toLowerCase() !== "compliant").length
      return {
        period,
        directivesAudited: inPeriod.length,
        events,
        damagePoints: inPeriod.reduce((s, a) => s + a.damagePoints, 0),
        cumulativeDamagePoints: 0,
        status: (events >= kpiSpec.threshold.fail ? "Fail" : "Target Met") as MonthlyRecord["status"],
      }
    })

  // Fill cumulative damage points.
  monthlyData.reduce((acc, row) => {
    const next = acc + row.damagePoints
    row.cumulativeDamagePoints = next
    return next
  }, 0)

  const totalEvents = monthlyData.reduce((s, r) => s + r.events, 0)
  const totalDirectivesAudited = monthlyData.reduce((s, r) => s + r.directivesAudited, 0)

  // Consecutive months ending latest with Target Met.
  let complianceStreak = 0
  for (let i = monthlyData.length - 1; i >= 0; i--) {
    if (monthlyData[i].status === "Target Met") complianceStreak++
    else break
  }

  const summary: Summary = {
    totalEvents,
    totalDamagePoints: monthlyData.reduce((s, r) => s + r.damagePoints, 0),
    totalDirectivesAudited,
    monthsReported: monthlyData.length,
    monthsAtTarget: monthlyData.filter((r) => r.status === "Target Met").length,
    complianceRate:
      totalDirectivesAudited === 0
        ? 100
        : Math.round(((totalDirectivesAudited - totalEvents) / totalDirectivesAudited) * 1000) / 10,
    complianceStreak,
  }

  return { audits, monthlyData, summary }
}
