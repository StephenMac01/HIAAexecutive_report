import { ShieldAlert } from "lucide-react"
import { KpiPageShell } from "@/components/portal/kpi-chrome"
import { SummaryCards } from "@/components/kpi-17/summary-cards"
import { ThresholdPanel } from "@/components/kpi-17/threshold-panel"
import { TrendChart } from "@/components/kpi-17/trend-chart"
import { ElementChart } from "@/components/kpi-17/element-chart"
import { SeverityChart } from "@/components/kpi-17/severity-chart"
import { EventsTable } from "@/components/kpi-17/events-table"
import { getKpiData } from "@/lib/kpi-17/get-data"

export async function Kpi17Dashboard() {
  const data = await getKpiData()

  return (
    <KpiPageShell
      icon={<ShieldAlert className="size-5" />}
      label="KPI-17"
      title="Contractor Safety Plan"
      description="HIAA contractor safety program adherence monitoring · Reporting period Jan–Dec 2025"
      footer="KPI-17 · Contractor Safety Plan · Data sourced from kpi-17-contractor-safety-plan.xlsx"
    >
      <SummaryCards data={data} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ThresholdPanel data={data} />
        </div>
        <div className="lg:col-span-2">
          <TrendChart monthly={data.monthly} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ElementChart byElement={data.byElement} />
        </div>
        <div className="lg:col-span-1">
          <SeverityChart bySeverity={data.bySeverity} />
        </div>
      </div>

      <EventsTable events={data.events} />
    </KpiPageShell>
  )
}
