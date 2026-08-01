export type KpiStatus = "fail" | "target" | "success"

/** One row per week — the shape the data owner fills in the Excel template. */
export interface WeeklyStaffingRow {
  weekEnding: string
  month: string
  office: string
  shiftsScheduled: number
  shiftsFilled: number
  reportedBy: string
  notes: string
}

export interface RawStaffingRow {
  month: string
  shiftsScheduled: number
  shiftsFilled: number
  /** Number of weekly reports that rolled into this month */
  weeks?: number
}

/** Group weekly rows into monthly totals used by the KPI calculation. */
export function groupWeeksToMonths(weeks: WeeklyStaffingRow[]): RawStaffingRow[] {
  const map = new Map<string, RawStaffingRow>()
  for (const w of weeks) {
    if (!w.month) continue
    const cur = map.get(w.month) ?? { month: w.month, shiftsScheduled: 0, shiftsFilled: 0, weeks: 0 }
    cur.shiftsScheduled += w.shiftsScheduled
    cur.shiftsFilled += w.shiftsFilled
    cur.weeks = (cur.weeks ?? 0) + 1
    map.set(w.month, cur)
  }
  return Array.from(map.values())
}

export interface StaffingRecord extends RawStaffingRow {
  /** Fill rate as a whole-number percentage, e.g. 80.6 */
  fillRate: number
  status: KpiStatus
  damagePoints: number
  advantagePoints: number
  /** advantagePoints - damagePoints */
  netPoints: number
  /** Human readable month label, e.g. "Jan 2025" */
  label: string
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function monthLabel(month: string): string {
  // Expects "YYYY-MM"
  const [y, m] = month.split("-")
  const idx = Number(m) - 1
  if (!y || Number.isNaN(idx) || idx < 0 || idx > 11) return month
  return `${MONTHS[idx]} ${y}`
}

export function statusFor(fillRate: number): KpiStatus {
  if (fillRate >= 91) return "success"
  if (fillRate >= 76) return "target"
  return "fail"
}

/**
 * Damage / advantage points per the KPI-21 rubric:
 *  - 100 damage per event below 50%
 *  - 75 damage per event 51%-60%
 *  - 50 damage per event 61%-75%
 *  - Target band (76%-90%): neutral
 *  - 100 advantage per event 91%-100%
 */
export function pointsFor(fillRate: number): { damage: number; advantage: number } {
  if (fillRate <= 50) return { damage: 100, advantage: 0 }
  if (fillRate <= 60) return { damage: 75, advantage: 0 }
  if (fillRate <= 75) return { damage: 50, advantage: 0 }
  if (fillRate <= 90) return { damage: 0, advantage: 0 }
  return { damage: 0, advantage: 100 }
}

export function toRecord(raw: RawStaffingRow): StaffingRecord {
  const rate = raw.shiftsScheduled > 0 ? (raw.shiftsFilled / raw.shiftsScheduled) * 100 : 0
  const fillRate = Math.round(rate * 10) / 10
  const status = statusFor(fillRate)
  const { damage, advantage } = pointsFor(fillRate)
  return {
    ...raw,
    fillRate,
    status,
    damagePoints: damage,
    advantagePoints: advantage,
    netPoints: advantage - damage,
    label: monthLabel(raw.month),
  }
}

export function buildRecords(rows: RawStaffingRow[]): StaffingRecord[] {
  return rows
    .filter((r) => r.month)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(toRecord)
}

export const STATUS_META: Record<KpiStatus, { label: string; token: string }> = {
  success: { label: "Success", token: "success" },
  target: { label: "Target", token: "warning" },
  fail: { label: "Fail", token: "destructive" },
}

export interface KpiSummary {
  months: number
  latest: StaffingRecord | null
  avgFillRate: number
  totalDamage: number
  totalAdvantage: number
  netPoints: number
  countByStatus: Record<KpiStatus, number>
}

export function summarize(records: StaffingRecord[]): KpiSummary {
  const months = records.length
  const totalDamage = records.reduce((s, r) => s + r.damagePoints, 0)
  const totalAdvantage = records.reduce((s, r) => s + r.advantagePoints, 0)
  const avg = months ? records.reduce((s, r) => s + r.fillRate, 0) / months : 0
  const countByStatus: Record<KpiStatus, number> = { fail: 0, target: 0, success: 0 }
  for (const r of records) countByStatus[r.status] += 1
  return {
    months,
    latest: months ? records[records.length - 1] : null,
    avgFillRate: Math.round(avg * 10) / 10,
    totalDamage,
    totalAdvantage,
    netPoints: totalAdvantage - totalDamage,
    countByStatus,
  }
}
