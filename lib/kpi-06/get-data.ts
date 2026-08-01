import "server-only"
import { sheetRows, coerceNumber as num } from "@/lib/xlsx-loader"
import { getKpiWorkbook } from "@/lib/kpi-data/get-rows"
import { buildDataset, type KpiDataset, type OpenInvoice, type WeekRecord } from "./kpi-data"

const WEEKLY_SHEET = "Weekly Invoicing Log"
const OPEN_SHEET = "Open Incorrect Invoices"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return value
  if (typeof value === "number") {
    // Excel serial fallback (days since 1899-12-30)
    return new Date(Math.round((value - 25569) * 86400 * 1000))
  }
  if (typeof value === "string") {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

export async function loadKpiDataset(): Promise<KpiDataset> {
  const wb = await getKpiWorkbook("kpi-06")

  // ----- Weekly Invoicing Log -----
  const weeklyRows = sheetRows<Record<string, unknown>>(wb, WEEKLY_SHEET)
  const records: WeekRecord[] = weeklyRows.map((row) => {
    const d = toDate(row["Week Ending"])
    const label = d ? `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}` : String(row["Week Ending"] ?? "")
    const period = d
      ? `Week ending ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
      : label
    return {
      weekEnding: d ? d.toISOString().slice(0, 10) : "",
      label,
      period,
      invoices: num(row["Invoices Submitted"]),
      late: num(row["Late Invoices"]),
      incorrect: num(row["Incorrect Invoices"]),
      rectifiedInTime: num(row["Rectified Within 30 Days"]),
      notRectified: num(row["Not Rectified After 30 Days"]),
      notes: String(row["Notes"] ?? ""),
    }
  })

  // ----- Open Incorrect Invoices -----
  const openRows = sheetRows<Record<string, unknown>>(wb, OPEN_SHEET)
  const openInvoices: OpenInvoice[] = openRows.map((row) => {
    const d = toDate(row["Submitted"])
    return {
      id: String(row["Invoice ID"] ?? ""),
      vendor: String(row["Description"] ?? ""),
      submitted: d
        ? `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, "0")}, ${d.getUTCFullYear()}`
        : String(row["Submitted"] ?? ""),
      amount: num(row["Amount (USD)"]),
      issue: String(row["Issue"] ?? ""),
      daysOpen: num(row["Days Open"]),
    }
  })

  return buildDataset(records, openInvoices)
}
