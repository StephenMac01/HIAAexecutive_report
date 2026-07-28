import { ShieldAlert } from "lucide-react"
import { KpiPageShell, KpiStatusBadge } from "@/components/portal/kpi-chrome"
import { KPI_META } from "@/lib/kpi-03/kpi-data"
import { getKpi03Data } from "@/lib/kpi-03/get-data"
import { SummaryCards } from "@/components/kpi-03/kpi/summary-cards"
import { OccurrencesChart } from "@/components/kpi-03/kpi/occurrences-chart"
import { StaffingChart } from "@/components/kpi-03/kpi/staffing-chart"
import { ShiftChart } from "@/components/kpi-03/kpi/shift-chart"
import { ScoringReference } from "@/components/kpi-03/kpi/scoring-reference"
import { OccurrencesTable } from "@/components/kpi-03/kpi/occurrences-table"

export async function Kpi03Dashboard() {
  const { occurrences, monthly, byShift, summary } = await getKpi03Data()
  const failing = summary.totalOccurrences >= KPI_META.threshold.fail

  return (
    <KpiPageShell
      icon={<ShieldAlert className="size-5" />}
      label={KPI_META.id}
      title={KPI_META.name}
      description={KPI_META.calculation}
      dataSource={`${KPI_META.reportingPeriod} · driven by the source Excel workbook`}
      actions={
        <KpiStatusBadge tone={failing ? "danger" : "success"}>
          {failing ? "Fail — Target Breached" : "Meeting Target"}
        </KpiStatusBadge>
      }
    >
      <SummaryCards summary={summary} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <OccurrencesChart monthly={monthly} />
        <StaffingChart monthly={monthly} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ShiftChart byShift={byShift} />
        <ScoringReference />
      </div>

      <OccurrencesTable occurrences={occurrences} />
    </KpiPageShell>
  )
}
