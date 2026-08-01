import "server-only"
import { getKpiSheetRows } from "@/lib/kpi-data/get-rows"
import {
  KPI_META,
  MONTH_LABELS,
  type Kpi03Data,
  type MonthlyPoint,
  type Occurrence,
  type ShiftBreakdown,
} from "@/lib/kpi-03/kpi-data"

type RawKpi03Row = {
  "Occurrence ID": string
  Date: string
  Shift: string
  Post: string
  Required: string | number
  Actual: string | number
  Duration: string
  "Damage Points": string | number
}

/** Read the live KPI-03 workbook and compute every derived dataset. */
export async function getKpi03Data(): Promise<Kpi03Data> {
  const rawRows = await getKpiSheetRows<RawKpi03Row>("kpi-03", "Data")

  const occurrences: Occurrence[] = rawRows
    .map((r) => ({
      id: String(r["Occurrence ID"]),
      date: String(r.Date).slice(0, 10),
      shift: String(r.Shift),
      post: String(r.Post),
      required: Number(r.Required) || 0,
      actual: Number(r.Actual) || 0,
      duration: String(r.Duration),
      damagePoints: Number(r["Damage Points"]) || 0,
    }))
    .sort((a, b) => b.date.localeCompare(a.date))

  const monthly: MonthlyPoint[] = MONTH_LABELS.map((month, i) => {
    const inMonth = occurrences.filter((o) => new Date(o.date).getMonth() === i)
    const occ = inMonth.length
    const avgStaffing = inMonth.length
      ? Math.round((inMonth.reduce((s, o) => s + o.actual, 0) / inMonth.length) * 10) / 10
      : KPI_META.minimumStaffing + 1
    return {
      month,
      occurrences: occ,
      target: 0,
      damagePoints: inMonth.reduce((s, o) => s + o.damagePoints, 0),
      avgStaffing,
      minStaffing: KPI_META.minimumStaffing,
    }
  })

  const byShift: ShiftBreakdown[] = Object.entries(
    occurrences.reduce<Record<string, number>>((acc, o) => {
      acc[o.shift] = (acc[o.shift] ?? 0) + 1
      return acc
    }, {}),
  ).map(([shift, count]) => ({ shift, occurrences: count }))

  const summary = {
    totalOccurrences: monthly.reduce((s, m) => s + m.occurrences, 0),
    totalDamagePoints: monthly.reduce((s, m) => s + m.damagePoints, 0),
    compliantMonths: monthly.filter((m) => m.occurrences === 0).length,
    totalMonths: monthly.length,
    worstMonth: monthly.reduce((a, b) => (b.occurrences > a.occurrences ? b : a)),
  }

  return { occurrences, monthly, byShift, summary }
}
