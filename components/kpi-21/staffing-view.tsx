"use client"

import { useMemo, useRef, useState } from "react"
import { Upload, ShieldCheck, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KpiPageShell } from "@/components/portal/kpi-chrome"
import { KpiSpec } from "@/components/kpi-21/kpi-spec"
import { SummaryCards } from "@/components/kpi-21/summary-cards"
import { FillRateChart } from "@/components/kpi-21/fill-rate-chart"
import { PointsChart } from "@/components/kpi-21/points-chart"
import { MonthlyTable } from "@/components/kpi-21/monthly-table"
import { WeeklyTable } from "@/components/kpi-21/weekly-table"
import { buildRecords, groupWeeksToMonths, summarize, type WeeklyStaffingRow } from "@/lib/kpi-21/kpi"
import { parseStaffingWorkbook } from "@/lib/kpi-21/parse-staffing"

/**
 * Interactive KPI-21 view. It is seeded with the live weekly rows already
 * parsed on the server, so it renders immediately with no client-side fetch or
 * Excel parsing on mount. The Excel parser only runs when a user actively
 * uploads their own workbook to preview it in place — never on the render path.
 */
export function StaffingView({
  initialWeeks,
  initialSource,
}: {
  initialWeeks: WeeklyStaffingRow[]
  initialSource: string
}) {
  const [weeks, setWeeks] = useState<WeeklyStaffingRow[]>(initialWeeks)
  const [source, setSource] = useState(initialSource)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const records = useMemo(() => buildRecords(groupWeeksToMonths(weeks)), [weeks])
  const summary = useMemo(() => summarize(records), [records])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    try {
      const buf = await file.arrayBuffer()
      const parsed = parseStaffingWorkbook(buf)
      if (parsed.length === 0) {
        setError(
          "No valid rows found. Expected weekly columns: Week Ending, Month, Office, Shifts Scheduled, Shifts Filled.",
        )
        return
      }
      setWeeks(parsed)
      setSource(file.name)
    } catch {
      setError("Could not read that file. Please upload a valid .xlsx workbook.")
    } finally {
      e.target.value = ""
    }
  }

  const actions = (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFile}
        aria-label="Upload staffing workbook"
      />
      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
        <Upload className="size-4" aria-hidden />
        Upload Excel
      </Button>
    </>
  )

  return (
    <KpiPageShell
      icon={<ShieldCheck className="size-5" />}
      label="KPI-21"
      title="Pass Control Staffing"
      description="Weekly HIAA staffing reports rolled up into monthly fill-rate performance and damage / advantage point tracking."
      actions={actions}
      dataSource={
        <>
          Data source: <span className="font-medium text-foreground">{source}</span>
        </>
      }
      footer="Shifts are counted as filled only when more than half the shift is covered. Fill rate determines the monthly damage or advantage point per the KPI-21 rubric."
    >
      {error ? (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>{error}</p>
        </div>
      ) : null}

      {records.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted-foreground">
          No data available. Upload a staffing workbook to begin.
        </p>
      ) : (
        <>
          <SummaryCards summary={summary} />
          <KpiSpec />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <FillRateChart records={records} />
            <PointsChart records={records} />
          </div>
          <MonthlyTable records={records} />
          <WeeklyTable weeks={weeks} />
        </>
      )}
    </KpiPageShell>
  )
}
