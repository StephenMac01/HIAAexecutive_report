import "server-only"
import type { RawContribution } from "./types"

// Each adapter imports a KPI's existing server loader and maps it into the
// normalized RawContribution shape (period totals + a native chronological
// series of damage/advantage points). Adapters never throw — the aggregator
// wraps them and substitutes a zeroed, unavailable contribution on failure.

import { getKpi01Data } from "@/lib/kpi-01/get-data"
import { getKpi02Data } from "@/lib/kpi-02/get-data"
import { getKpi03Data } from "@/lib/kpi-03/get-data"
import { getDashboardData as getKpi04Data } from "@/lib/kpi-04/get-data"
import { getKpi05Data } from "@/lib/kpi-05/get-data"
import { loadKpiDataset as getKpi06Data } from "@/lib/kpi-06/get-data"
import { getKpi07Data } from "@/lib/kpi-07/get-data"
import { getKpi08Data } from "@/lib/kpi-08/get-data"
import { getTimelinessData as getKpi09Data } from "@/lib/kpi-09/get-data"
import { getKpi10Data } from "@/lib/kpi-10/get-data"
import { getKpi11Data } from "@/lib/kpi-11/get-data"
import { getKpi12Data } from "@/lib/kpi-12/get-data"
import { loadBriefingEvents } from "@/lib/kpi-13/get-data"
import { getTotals as getKpi13Totals, getWeeklyTrend as getKpi13Trend } from "@/lib/kpi-13/kpi-data"
import { getKpi14Data } from "@/lib/kpi-14/get-data"
import { getKpiData as getKpi15Data } from "@/lib/kpi-15/get-data"
import { getKpi16Data } from "@/lib/kpi-16/get-data"
import { getKpiData as getKpi17Data } from "@/lib/kpi-17/get-data"
import { getKpi18Data } from "@/lib/kpi-18/get-data"
import { getKpi19Data } from "@/lib/kpi-19/get-data"
import { getDashboard as getKpi20Data } from "@/lib/kpi-20/get-data"
import { getKpi21Data } from "@/lib/kpi-21/get-data"

export const ADAPTERS: Record<string, () => Promise<RawContribution>> = {
  "kpi-01": async () => {
    const d = await getKpi01Data()
    return {
      periodDamage: d.summary.totalDamagePoints,
      periodAdvantage: 0,
      actual: `${d.summary.counted} counted event${d.summary.counted === 1 ? "" : "s"}`,
      native: d.cumulativeTimeline.map((t) => ({ label: t.month, damage: t.points, advantage: 0 })),
    }
  },
  "kpi-02": async () => {
    const d = await getKpi02Data()
    return {
      periodDamage: 0,
      periodAdvantage: d.summary.totalAdvantagePoints,
      actual: `${d.summary.totalCounted} compliments`,
      native: d.monthly.map((m) => ({ label: m.month, damage: 0, advantage: m.advantagePoints })),
    }
  },
  "kpi-03": async () => {
    const d = await getKpi03Data()
    return {
      periodDamage: d.summary.totalDamagePoints,
      periodAdvantage: 0,
      actual: `${d.summary.totalOccurrences} occurrences`,
      native: d.monthly.map((m) => ({ label: m.month, damage: m.damagePoints, advantage: 0 })),
    }
  },
  "kpi-04": async () => {
    const d = await getKpi04Data()
    const perEvent = d.currentEventCount > 0 ? d.currentDamagePoints / d.currentEventCount : 2
    return {
      periodDamage: d.ytdDamagePoints,
      periodAdvantage: 0,
      actual: `${d.ytdEvents} events`,
      native: d.monthlySeries.map((m) => ({
        label: m.key,
        damage: (m.lateReport + m.noNotice) * perEvent,
        advantage: 0,
      })),
    }
  },
  "kpi-05": async () => {
    const d = await getKpi05Data()
    return {
      periodDamage: d.summary.damagePoints,
      periodAdvantage: 0,
      actual: `${d.summary.totalEvents} events`,
      native: d.monthly.map((m) => ({ label: m.month, damage: m.damage, advantage: 0 })),
    }
  },
  "kpi-06": async () => {
    const d = await getKpi06Data()
    return {
      periodDamage: d.totals.damagePoints,
      periodAdvantage: 0,
      actual: `${d.totals.events} events`,
      native: d.weeks.map((w) => ({ label: w.label, damage: w.damagePoints, advantage: 0 })),
    }
  },
  "kpi-07": async () => {
    const d = await getKpi07Data()
    return {
      periodDamage: d.summary.totalDamagePoints,
      periodAdvantage: 0,
      actual: `${d.summary.totalIncidents} incidents`,
      native: d.monthlyIncidents.map((m) => ({ label: m.month, damage: m.damagePoints, advantage: 0 })),
    }
  },
  "kpi-08": async () => {
    const d = await getKpi08Data()
    const periodDamage = d.complianceTrend.reduce((s, t) => s + t.points, 0)
    return {
      periodDamage,
      periodAdvantage: 0,
      actual: `${d.patrolSummary.complianceRate}% compliance`,
      native: d.complianceTrend.map((t) => ({ label: t.month, damage: t.points, advantage: 0 })),
    }
  },
  "kpi-09": async () => {
    const d = await getKpi09Data()
    return {
      periodDamage: d.ytd.damagePoints,
      periodAdvantage: 0,
      actual: `${Math.round(d.period.onTimeRate)}% on-time`,
      native: d.monthlyTrend.map((m) => ({ label: m.month, damage: m.damagePoints, advantage: 0 })),
    }
  },
  "kpi-10": async () => {
    const d = await getKpi10Data()
    return {
      periodDamage: d.currentPeriod.damagePoints,
      periodAdvantage: 0,
      actual: `${d.currentPeriod.events} events`,
      native: d.dailyEvents.map((e) => ({ label: e.date, damage: e.damage, advantage: 0 })),
    }
  },
  "kpi-11": async () => {
    const d = await getKpi11Data()
    return {
      periodDamage: d.summary.totalDamagePoints,
      periodAdvantage: 0,
      actual: `${d.summary.totalEvents} events`,
      native: d.monthlyData.map((m) => ({ label: m.period, damage: m.damagePoints, advantage: 0 })),
    }
  },
  "kpi-12": async () => {
    const d = await getKpi12Data()
    return {
      periodDamage: d.totalDamagePoints,
      periodAdvantage: 0,
      actual: `${d.totalEvents} events`,
      native: d.monthlyEvents.map((m) => ({ label: m.month, damage: m.damagePoints, advantage: 0 })),
    }
  },
  "kpi-13": async () => {
    const events = await loadBriefingEvents()
    const totals = getKpi13Totals(events)
    const trend = getKpi13Trend(events)
    return {
      periodDamage: totals.totalDamagePoints,
      periodAdvantage: 0,
      actual: `${totals.totalEvents} events`,
      native: trend.map((w) => ({ label: w.weekStarting || w.week, damage: w.damagePoints, advantage: 0 })),
    }
  },
  "kpi-14": async () => {
    const d = await getKpi14Data()
    return {
      periodDamage: d.summary.damagePoints,
      periodAdvantage: 0,
      actual: `${d.summary.unauthorized} unauthorized`,
      native: d.monthly.map((m) => ({ label: m.month, damage: m.damage, advantage: 0 })),
    }
  },
  "kpi-15": async () => {
    const d = await getKpi15Data()
    return {
      periodDamage: d.totals.damagePoints,
      periodAdvantage: 0,
      actual: `${d.totals.events} events`,
      native: d.weekly.map((w) => ({ label: w.label, damage: w.damagePoints, advantage: 0 })),
    }
  },
  "kpi-16": async () => {
    const d = await getKpi16Data()
    const perEvent = d.totals.totalEvents > 0 ? d.totals.damagePoints / d.totals.totalEvents : 0
    return {
      periodDamage: d.totals.damagePoints,
      periodAdvantage: 0,
      actual: `${Math.round(d.totals.overallCompliancePct)}% compliance`,
      native: d.monthlySummary.map((m) => ({
        label: m.month,
        damage: (m.emergencyBreaches + m.nonEmergencyBreaches) * perEvent,
        advantage: 0,
      })),
    }
  },
  "kpi-17": async () => {
    const d = await getKpi17Data()
    return {
      periodDamage: d.totalDamage,
      periodAdvantage: 0,
      actual: `${d.totalEvents} events`,
      native: d.monthly.map((m) => ({ label: m.month, damage: m.damage, advantage: 0 })),
    }
  },
  "kpi-18": async () => {
    const d = await getKpi18Data()
    return {
      periodDamage: d.totals.damagePoints,
      periodAdvantage: 0,
      actual: `${d.totals.totalEvents} events`,
      native: d.trend.map((m) => ({ label: m.month, damage: m.damage, advantage: 0 })),
    }
  },
  "kpi-19": async () => {
    const d = await getKpi19Data()
    return {
      periodDamage: d.summary.damagePoints,
      periodAdvantage: 0,
      actual: `${d.summary.totalEvents} events`,
      native: d.trend.map((m) => ({ label: m.month, damage: m.damagePoints, advantage: 0 })),
    }
  },
  "kpi-20": async () => {
    const d = await getKpi20Data()
    return {
      periodDamage: d.totals.totalDamagePoints,
      periodAdvantage: 0,
      actual: `${d.totals.totalEvents} events`,
      native: d.weeklyTrend.map((w) => ({ label: w.week, damage: w.damagePoints, advantage: 0 })),
    }
  },
  "kpi-21": async () => {
    const d = await getKpi21Data()
    return {
      periodDamage: d.summary.totalDamage,
      periodAdvantage: d.summary.totalAdvantage,
      actual: `${d.summary.avgFillRate}% avg fill`,
      native: d.records.map((r) => ({ label: r.month, damage: r.damagePoints, advantage: r.advantagePoints })),
    }
  },
}
