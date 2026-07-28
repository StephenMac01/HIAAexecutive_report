import { ShieldAlert } from "lucide-react"
import { KpiPageShell, KpiStatusBadge, KpiSpecTable, type KpiSpecRow } from "@/components/portal/kpi-chrome"
import { KPI_META } from "@/lib/kpi-07/kpi-data"
import { getKpi07Data } from "@/lib/kpi-07/get-data"
import { KpiSummaryCards } from "@/components/kpi-07/kpi-summary-cards"
import { IncidentTrendChart } from "@/components/kpi-07/incident-trend-chart"
import { DamagePointsChart } from "@/components/kpi-07/damage-points-chart"
import { CategoryBreakdownChart } from "@/components/kpi-07/category-breakdown-chart"
import { IncidentLogTable } from "@/components/kpi-07/incident-log-table"

export async function Kpi07Dashboard() {
  const { incidentLog, categoryBreakdown, monthlyIncidents, summary } = await getKpi07Data()
  const isFailing = summary.totalIncidents >= KPI_META.failThreshold

  const specRows: KpiSpecRow[] = [
    {
      label: "Threshold",
      cells: [
        { content: `Target: ${KPI_META.target} events`, tone: "success", align: "center" },
        { content: `Fail: ${KPI_META.failThreshold} event`, tone: "danger", align: "center" },
        { content: `Damage: ${KPI_META.damagePointsPerEvent}/event`, tone: "warning", align: "center" },
        { content: "Advantage: n/a", tone: "muted", align: "center" },
      ],
    },
  ]

  return (
    <KpiPageShell
      icon={<ShieldAlert className="size-5" />}
      label={`${KPI_META.id} · Performance Indicator`}
      title={KPI_META.title}
      description={`${KPI_META.description} HIAA will engage with the Contractor to discuss such infractions or incidents prior to administering any Damage Points.`}
      dataSource="Driven by the source Excel workbook"
      actions={
        <KpiStatusBadge tone={isFailing ? "danger" : "success"}>
          {isFailing ? "Non-Compliant" : "On Target"}
        </KpiStatusBadge>
      }
    >
      <KpiSpecTable code={KPI_META.id} title={KPI_META.title} rows={specRows} />
      <KpiSummaryCards summary={summary} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <IncidentTrendChart monthlyIncidents={monthlyIncidents} />
        <DamagePointsChart monthlyIncidents={monthlyIncidents} />
      </div>
      <CategoryBreakdownChart categoryBreakdown={categoryBreakdown} />
      <IncidentLogTable incidentLog={incidentLog} />
    </KpiPageShell>
  )
}
