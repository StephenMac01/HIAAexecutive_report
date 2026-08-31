// Executive Summary (Schedule "D") — configuration constants.
// Everything HIAA-editable lives here. No dedicated workbook is used; the
// summary auto-aggregates the 21 KPI loaders, so these constants define the
// contract framing (rolling window, default bands, transition period, rules).

import type { DefaultBand } from "./types"

/**
 * Anchor month for the portfolio timeline (YYYY-MM). The newest data point of
 * every KPI is aligned to this month. If any KPI reports a later real calendar
 * month, the aggregator advances the anchor automatically.
 * EDITABLE: set to the current reporting month.
 */
export const REPORTING_ANCHOR = "2026-07"

/** Rolling Contractor Event-of-Default window, in months. */
export const ROLLING_WINDOW_MONTHS = 6

/** Damage-point ceiling that triggers a Section 15 Event of Default. */
export const DEFAULT_THRESHOLD = 500

/** Default-risk colour bands keyed off the rolling 6-month damage total. */
export const DEFAULT_BANDS: { band: DefaultBand; min: number; max: number; label: string }[] = [
  { band: "green", min: 0, max: 249, label: "On Track" },
  { band: "yellow", min: 250, max: 399, label: "Monitor" },
  { band: "orange", min: 400, max: 499, label: "At Risk" },
  { band: "red", min: 500, max: Number.POSITIVE_INFINITY, label: "Event of Default" },
]

export function bandForDamage(total: number): DefaultBand {
  return DEFAULT_BANDS.find((b) => total >= b.min && total <= b.max)?.band ?? "green"
}

/**
 * Transition period (Schedule "D"). During transition, damage points are
 * reported for information but financial penalties are not applied.
 * EDITABLE: set the real contract transition dates.
 */
export const TRANSITION = {
  effectiveDate: "2026-02-01",
  endDate: "2026-08-01",
} as const

/** Schedule "D" contract rules, shown in the always-visible rules panel. */
export const SCHEDULE_D_RULES: string[] = [
  "Each KPI is measured every reporting month; damage points accrue in the month the failure occurs.",
  "Damage points are summed across all KPIs to produce the monthly Liquidated Damages total.",
  "Advantage points earned in a month offset that month's damage points; the net cannot go below zero.",
  "Damage and advantage points are not carried forward — each month stands on its own for the financial calculation.",
  "A rolling six-month damage-point total is maintained for every reporting month.",
  "If the rolling six-month total reaches 500 damage points, a Contractor Event of Default occurs under Section 15.",
  "During the transition period, damage points are reported for information only and no financial penalty is applied.",
]

/** Display metadata for each KPI (names + threshold framing for the grid). */
export type KpiMetaEntry = {
  code: string
  name: string
  target: string
  fail: string
  hasAdvantage: boolean
}

export const KPI_META: Record<string, KpiMetaEntry> = {
  "kpi-01": { code: "KPI-01", name: "Service Refusal, Inaccurate Info & Unsafe Conduct", target: "0 events", fail: "≥ 1 event", hasAdvantage: false },
  "kpi-02": { code: "KPI-02", name: "Customer Compliments", target: "≥ 1 compliment", fail: "0 compliments", hasAdvantage: true },
  "kpi-03": { code: "KPI-03", name: "Minimum Staffing Levels", target: "0 occurrences", fail: "≥ 1 occurrence", hasAdvantage: false },
  "kpi-04": { code: "KPI-04", name: "Absent Post / No-Show Reporting", target: "0 events", fail: "≥ 1 event", hasAdvantage: false },
  "kpi-05": { code: "KPI-05", name: "Untrained or Unqualified Personnel", target: "0 events", fail: "≥ 1 event", hasAdvantage: false },
  "kpi-06": { code: "KPI-06", name: "Invoicing", target: "0 events", fail: "≥ 1 event", hasAdvantage: false },
  "kpi-07": { code: "KPI-07", name: "Security Incident Reporting", target: "0 incidents", fail: "≥ 1 incident", hasAdvantage: false },
  "kpi-08": { code: "KPI-08", name: "Patrol Compliance", target: "100% patrols", fail: "Missed patrols", hasAdvantage: false },
  "kpi-09": { code: "KPI-09", name: "Deliverable Timeliness", target: "On time", fail: "Late deliverable", hasAdvantage: false },
  "kpi-10": { code: "KPI-10", name: "Uniform Compliance", target: "0 events", fail: "≥ 1 event", hasAdvantage: false },
  "kpi-11": { code: "KPI-11", name: "Post Order / Directive Compliance", target: "0 events", fail: "≥ 1 event", hasAdvantage: false },
  "kpi-12": { code: "KPI-12", name: "Complaint Handling", target: "0 events", fail: "≥ 1 event", hasAdvantage: false },
  "kpi-13": { code: "KPI-13", name: "Shift Briefings", target: "0 events", fail: "≥ 1 event", hasAdvantage: false },
  "kpi-14": { code: "KPI-14", name: "Document & Training Changes", target: "0 unauthorized", fail: "≥ 1 unauthorized", hasAdvantage: false },
  "kpi-15": { code: "KPI-15", name: "Vehicle & Equipment Compliance", target: "0 events", fail: "≥ 1 event", hasAdvantage: false },
  "kpi-16": { code: "KPI-16", name: "Emergency Response Time", target: "Within SLA", fail: "SLA breach", hasAdvantage: false },
  "kpi-17": { code: "KPI-17", name: "Contractor Safety Plan", target: "0 events", fail: "≥ 1 event", hasAdvantage: false },
  "kpi-18": { code: "KPI-18", name: "Incident Reporting", target: "0 events", fail: "≥ 1 event", hasAdvantage: false },
  "kpi-19": { code: "KPI-19", name: "Distracted on Duty", target: "0 events", fail: "≥ 1 event", hasAdvantage: false },
  "kpi-20": { code: "KPI-20", name: "Minimum Shift Staffing", target: "Above minimum", fail: "Below minimum", hasAdvantage: false },
  "kpi-21": { code: "KPI-21", name: "Pass Control Office Staffing", target: "76–90% fill", fail: "≤ 75% fill", hasAdvantage: true },
}
