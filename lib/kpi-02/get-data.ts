import "server-only"
import { getKpiSheetRows } from "@/lib/kpi-data/get-rows"
import {
  advantagePoints,
  COMPLIMENT_SOURCES,
  KPI02,
  MONTHS,
  type ComplimentEvent,
  type ComplimentSource,
  type Kpi02Data,
  type Kpi02Summary,
  type MonthlyPoint,
  type SourceDatum,
} from "@/lib/kpi-02/kpi-data"

type RawKpi02Row = {
  ID: string
  Date: string
  Source: string
  Solicited: string
  Summary: string
}

function toEvents(rows: RawKpi02Row[]): ComplimentEvent[] {
  return rows.map((r) => ({
    id: String(r.ID),
    date: String(r.Date).slice(0, 10),
    source: r.Source as ComplimentSource,
    solicited: String(r.Solicited).trim().toLowerCase() === "yes",
    summary: String(r.Summary),
  }))
}

function buildMonthly(events: ComplimentEvent[]): MonthlyPoint[] {
  const buckets: MonthlyPoint[] = MONTHS.map((month, monthIndex) => ({
    month,
    monthIndex,
    counted: 0,
    solicited: 0,
    advantagePoints: 0,
    met: false,
  }))

  for (const ev of events) {
    const idx = new Date(ev.date).getUTCMonth()
    if (ev.solicited) buckets[idx].solicited += 1
    else buckets[idx].counted += 1
  }

  for (const b of buckets) {
    b.advantagePoints = advantagePoints(b.counted)
    b.met = b.counted >= KPI02.target
  }

  return buckets
}

function buildSourceBreakdown(events: ComplimentEvent[]): SourceDatum[] {
  const counts = new Map<ComplimentSource, number>()
  for (const s of COMPLIMENT_SOURCES) counts.set(s, 0)
  for (const ev of events) {
    if (ev.solicited) continue
    counts.set(ev.source, (counts.get(ev.source) ?? 0) + 1)
  }
  return COMPLIMENT_SOURCES.map((source) => ({
    source,
    count: counts.get(source) ?? 0,
  })).sort((a, b) => b.count - a.count)
}

function buildSummary(events: ComplimentEvent[], monthly: MonthlyPoint[]): Kpi02Summary {
  const totalCounted = events.filter((e) => !e.solicited).length
  const totalSolicitedExcluded = events.filter((e) => e.solicited).length
  const totalAdvantagePoints = monthly.reduce((s, m) => s + m.advantagePoints, 0)
  const monthsMeetingTarget = monthly.filter((m) => m.met).length
  const bestMonth = monthly.reduce((best, m) => (m.counted > best.counted ? m : best), monthly[0])

  return {
    totalCounted,
    totalSolicitedExcluded,
    totalAdvantagePoints,
    monthsMeetingTarget,
    totalMonths: monthly.length,
    bestMonth,
  }
}

/** Read the live KPI-02 workbook and compute every derived dataset. */
export async function getKpi02Data(): Promise<Kpi02Data> {
  const rows = await getKpiSheetRows<RawKpi02Row>("kpi-02", "Data")
  const events = toEvents(rows)
  const monthly = buildMonthly(events)
  const sourceBreakdown = buildSourceBreakdown(events)
  const summary = buildSummary(events, monthly)
  return { events, monthly, sourceBreakdown, summary }
}
