import { FileSpreadsheet, Gauge } from "lucide-react"
import { KpiPageShell } from "@/components/portal/kpi-chrome"
import { StatusBanner } from "@/components/kpi-09/status-banner"
import { SummaryCards } from "@/components/kpi-09/summary-cards"
import { EventsTrendChart, DamagePointsChart } from "@/components/kpi-09/timeliness-charts"
import { DeliverablesTable } from "@/components/kpi-09/deliverables-table"
import { KpiDefinition } from "@/components/kpi-09/kpi-definition"
import { getTimelinessData } from "@/lib/kpi-09/get-data"

export async function Kpi09Dashboard() {
  const data = await getTimelinessData()

  return (
    <KpiPageShell
      icon={<Gauge className="size-5" />}
      label="KPI-9 · Performance Scorecard"
      title="Timeliness Dashboard"
      description="Monitoring on-time delivery of reports and documents against the Agreement. Each material failure counts as one event and accrues 10 damage points."
      actions={
        <span className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
          <FileSpreadsheet className="size-4" aria-hidden="true" />
          Excel · {data.allDeliverables.length} rows · {data.period.label}
        </span>
      }
    >
      <StatusBanner period={data.period} />
      <SummaryCards period={data.period} ytd={data.ytd} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EventsTrendChart data={data.monthlyTrend} />
        <DamagePointsChart data={data.monthlyTrend} />
      </div>
      <DeliverablesTable deliverables={data.deliverables} periodLabel={data.period.label} />
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">KPI definition</h2>
        <KpiDefinition />
      </section>
    </KpiPageShell>
  )
}
