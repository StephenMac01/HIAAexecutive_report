import "server-only"
import { KPIS } from "@/lib/kpi-registry"
import { ADAPTERS } from "./adapters"
import {
  REPORTING_ANCHOR,
  ROLLING_WINDOW_MONTHS,
  DEFAULT_THRESHOLD,
  TRANSITION,
  SCHEDULE_D_RULES,
  KPI_META,
  bandForDamage,
} from "./config"
import type {
  CanonicalMonth,
  ExecutiveSummary,
  KpiContribution,
  KpiStatus,
  MonthlyPoints,
  RawContribution,
  TransitionState,
} from "./types"

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function keyToLabel(key: string): string {
  const [y, m] = key.split("-")
  const idx = Number(m) - 1
  return `${MONTH_LABELS[idx] ?? m} ${y}`
}

function addMonths(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number)
  const base = y * 12 + (m - 1) + delta
  const year = Math.floor(base / 12)
  const month = (base % 12 + 12) % 12
  return `${year}-${String(month + 1).padStart(2, "0")}`
}

function buildCanonicalMonths(anchorKey: string, count = 12): CanonicalMonth[] {
  const out: CanonicalMonth[] = []
  for (let i = count - 1; i >= 0; i--) {
    const key = addMonths(anchorKey, -i)
    out.push({ key, label: keyToLabel(key) })
  }
  return out
}

/**
 * Bucket a KPI's native series into a fixed 12-slot monthly vector aligned to
 * the canonical timeline (index 0 = oldest month, 11 = reporting/anchor month).
 *
 * KPIs report at different cadences (monthly, weekly, daily) with inconsistent
 * label formats, so rather than parse calendar dates (which is fragile and can
 * misread day-of-month labels as years) we align positionally:
 *  - ≤ 12 native points: mapped newest → anchor, older slots zero-padded.
 *  - > 12 native points (weekly/daily): the whole series is chunked into 12
 *    contiguous groups spanning the reporting window, newest group → anchor.
 * Period totals used elsewhere come straight from each loader and stay exact;
 * this bucketing only shapes the monthly trend + reporting-month figure.
 */
function bucketizeToMonths(
  native: RawContribution["native"],
  count: number,
): { damage: number; advantage: number }[] {
  const out = Array.from({ length: count }, () => ({ damage: 0, advantage: 0 }))
  const n = native.length
  if (n === 0) return out

  if (n <= count) {
    for (let i = 0; i < n; i++) {
      const idx = count - n + i
      out[idx].damage += native[i].damage
      out[idx].advantage += native[i].advantage
    }
  } else {
    for (let i = 0; i < n; i++) {
      const idx = Math.min(count - 1, Math.floor((i * count) / n))
      out[idx].damage += native[i].damage
      out[idx].advantage += native[i].advantage
    }
  }
  return out
}

function statusFor(monthDamage: number, periodDamage: number): KpiStatus {
  if (monthDamage > 0) return "red"
  if (periodDamage > 0) return "amber"
  return "green"
}

function computeTransition(anchorKey: string): TransitionState {
  const start = new Date(`${TRANSITION.effectiveDate}T00:00:00Z`)
  const end = new Date(`${TRANSITION.endDate}T00:00:00Z`)
  const now = new Date(`${anchorKey}-15T00:00:00Z`)
  const totalMonths = Math.max(
    1,
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth()),
  )
  const elapsed = Math.min(
    totalMonths,
    Math.max(0, (now.getUTCFullYear() - start.getUTCFullYear()) * 12 + (now.getUTCMonth() - start.getUTCMonth())),
  )
  const remaining = Math.max(0, totalMonths - elapsed)
  return {
    active: now < end,
    effectiveDate: TRANSITION.effectiveDate,
    endDate: TRANSITION.endDate,
    totalMonths,
    monthsElapsed: elapsed,
    monthsRemaining: remaining,
    progressPct: Math.round((elapsed / totalMonths) * 100),
  }
}

/** Build the full Executive Summary by aggregating all 21 KPI adapters. */
export async function getExecutiveSummary(): Promise<ExecutiveSummary> {
  const ids = KPIS.map((k) => k.id)

  // Run every adapter defensively; a failure yields an unavailable contribution.
  const raws = await Promise.all(
    ids.map(async (id): Promise<{ id: string; raw: RawContribution | null }> => {
      const adapter = ADAPTERS[id]
      if (!adapter) return { id, raw: null }
      try {
        return { id, raw: await adapter() }
      } catch (err) {
        console.log(`[v0] exec-summary adapter failed for ${id}:`, err instanceof Error ? err.message : err)
        return { id, raw: null }
      }
    }),
  )

  // The reporting month is the configured anchor; every KPI's newest data point
  // is aligned to it. This keeps the portfolio timeline stable and readable
  // regardless of each KPI's native cadence or label format.
  const anchorKey = REPORTING_ANCHOR
  const canonical = buildCanonicalMonths(anchorKey, 12)
  const canonicalKeys = new Set(canonical.map((c) => c.key))

  const contributions: KpiContribution[] = raws.map(({ id, raw }) => {
    const meta = KPI_META[id]
    if (!raw) {
      return {
        id,
        code: meta?.code ?? id.toUpperCase(),
        name: meta?.name ?? id,
        target: meta?.target ?? "—",
        fail: meta?.fail ?? "—",
        actual: "Unavailable",
        status: "amber",
        monthDamage: 0,
        monthAdvantage: 0,
        periodDamage: 0,
        periodAdvantage: 0,
        monthly: canonical.map((c) => ({ key: c.key, label: c.label, damage: 0, advantage: 0, net: 0 })),
        available: false,
      }
    }

    const buckets = bucketizeToMonths(raw.native, canonical.length)
    const monthly: MonthlyPoints[] = canonical.map((c, i) => {
      const damage = Math.round(buckets[i].damage)
      const advantage = Math.round(buckets[i].advantage)
      return { key: c.key, label: c.label, damage, advantage, net: Math.max(0, damage - advantage) }
    })
    const atAnchor = monthly[monthly.length - 1]

    return {
      id,
      code: meta?.code ?? id.toUpperCase(),
      name: meta?.name ?? id,
      target: meta?.target ?? "—",
      fail: meta?.fail ?? "—",
      actual: raw.actual,
      status: statusFor(atAnchor.damage, Math.round(raw.periodDamage)),
      monthDamage: atAnchor.damage,
      monthAdvantage: atAnchor.advantage,
      periodDamage: Math.round(raw.periodDamage),
      periodAdvantage: Math.round(raw.periodAdvantage),
      monthly,
      available: true,
    }
  })

  // Portfolio monthly = sum across KPIs per canonical month.
  const portfolioMonthly: MonthlyPoints[] = canonical.map((c, i) => {
    let damage = 0
    let advantage = 0
    for (const contrib of contributions) {
      damage += contrib.monthly[i].damage
      advantage += contrib.monthly[i].advantage
    }
    return { key: c.key, label: c.label, damage, advantage, net: Math.max(0, damage - advantage) }
  })

  const reportingIdx = portfolioMonthly.length - 1
  const reporting = portfolioMonthly[reportingIdx]
  const rollingWindow = portfolioMonthly.slice(-ROLLING_WINDOW_MONTHS)
  const rollingSixMonthDamage = rollingWindow.reduce((s, m) => s + m.damage, 0)

  return {
    reportingMonthKey: anchorKey,
    reportingMonth: keyToLabel(anchorKey),
    kpisReported: contributions.filter((c) => c.available).length,
    kpisTotal: contributions.length,
    monthlyDamagePoints: reporting.damage,
    monthlyAdvantagePoints: reporting.advantage,
    netMonthlyDamagePoints: reporting.net,
    rollingSixMonthDamage,
    defaultThreshold: DEFAULT_THRESHOLD,
    defaultBand: bandForDamage(rollingSixMonthDamage),
    transition: computeTransition(anchorKey),
    canonicalMonths: canonical.filter((c) => canonicalKeys.has(c.key)),
    portfolioMonthly,
    rollingWindow,
    contributions,
    rules: SCHEDULE_D_RULES,
  }
}
