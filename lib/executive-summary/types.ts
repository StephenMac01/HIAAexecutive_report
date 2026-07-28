// Executive Summary (Schedule "D") — shared types.
// Client-safe: no server-only imports here so chart components can import types.

export type KpiStatus = "green" | "amber" | "red"

/** Contract Event-of-Default band derived from the rolling 6-month damage total. */
export type DefaultBand = "green" | "yellow" | "orange" | "red"

/** A single month on the canonical portfolio timeline. */
export type CanonicalMonth = { key: string; label: string }

/** Damage/advantage for one month (already keyed to the canonical timeline). */
export type MonthlyPoints = {
  key: string
  label: string
  damage: number
  advantage: number
  net: number
}

/** What each per-KPI adapter returns before canonical alignment. */
export type RawContribution = {
  /** Total damage points across the whole reported period. */
  periodDamage: number
  /** Total advantage points across the whole reported period (0 when n/a). */
  periodAdvantage: number
  /** Short human-readable "actual" measure shown in the grid, e.g. "3 events". */
  actual: string
  /** Native monthly/weekly/daily series in chronological order. */
  native: { label: string; damage: number; advantage: number }[]
}

/** A fully normalized KPI row on the Executive Summary. */
export type KpiContribution = {
  id: string // route slug, e.g. "kpi-01"
  code: string // "KPI-01"
  name: string
  target: string
  fail: string
  actual: string
  status: KpiStatus
  /** Damage/advantage attributed to the reporting month. */
  monthDamage: number
  monthAdvantage: number
  /** Whole-period totals (for context / tooltips). */
  periodDamage: number
  periodAdvantage: number
  /** Canonical-aligned monthly series (up to 12 months). */
  monthly: MonthlyPoints[]
  /** false when the live load failed and figures are zeroed. */
  available: boolean
}

export type TransitionState = {
  active: boolean
  effectiveDate: string
  endDate: string
  totalMonths: number
  monthsElapsed: number
  monthsRemaining: number
  progressPct: number
}

export type ExecutiveSummary = {
  reportingMonthKey: string
  reportingMonth: string
  kpisReported: number
  kpisTotal: number
  monthlyDamagePoints: number
  monthlyAdvantagePoints: number
  netMonthlyDamagePoints: number
  rollingSixMonthDamage: number
  defaultThreshold: number
  defaultBand: DefaultBand
  transition: TransitionState
  canonicalMonths: CanonicalMonth[]
  portfolioMonthly: MonthlyPoints[]
  rollingWindow: MonthlyPoints[]
  contributions: KpiContribution[]
  rules: string[]
}
