import { ShieldCheck } from "lucide-react"
import { KpiPageShell, KpiStatusBadge } from "@/components/portal/kpi-chrome"
import { KpiStatCards } from "@/components/kpi-16/kpi-stat-cards"
import { ResponseTrendChart } from "@/components/kpi-16/response-trend-chart"
import { BreachEventsChart } from "@/components/kpi-16/breach-events-chart"
import { KpiDefinitionCard } from "@/components/kpi-16/kpi-definition-card"
import { IncidentTable } from "@/components/kpi-16/incident-table"
import { KPI_META } from "@/lib/kpi-16/kpi-data"
import { getKpi16Data } from "@/lib/kpi-16/get-data"

export async function Kpi16Dashboard() {
  const { incidents, monthlySummary, totals } = await getKpi16Data()
  const isSuccess = totals.status === "Success"

  return (
    <KpiPageShell
      icon={<ShieldCheck className="size-5" />}
      label={`${KPI_META.id} · Reporting period Jan – Jun 2026`}
      title={KPI_META.name}
      description={`Initial officer response performance for emergency (${KPI_META.emergencyTargetMinutes} min) and non-emergency (${KPI_META.nonEmergencyTargetMinutes} min) incidents.`}
      actions={
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">KPI Status</span>
          <KpiStatusBadge tone={isSuccess ? "success" : "danger"}>{totals.status}</KpiStatusBadge>
        </div>
      }
      footer={
        <span>
          Every metric above is powered by the weekly incident log. Download the source workbook, add one row per week,
          and the dashboard updates from it.
        </span>
      }
    >
      <KpiStatCards totals={totals} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ResponseTrendChart monthlySummary={monthlySummary} />
        <BreachEventsChart monthlySummary={monthlySummary} />
      </div>

      <KpiDefinitionCard />

      <IncidentTable incidents={incidents} />
    </KpiPageShell>
  )
}
