import { CalendarDays, ShieldAlert } from "lucide-react"
import { KpiPageShell } from "@/components/portal/kpi-chrome"
import { ResultBanner } from "@/components/kpi-01/kpi/result-banner"
import { SummaryCards } from "@/components/kpi-01/kpi/summary-cards"
import { CategoryChart } from "@/components/kpi-01/kpi/category-chart"
import { SourceChart } from "@/components/kpi-01/kpi/source-chart"
import { TrendChart } from "@/components/kpi-01/kpi/trend-chart"
import { EventTable } from "@/components/kpi-01/kpi/event-table"
import { kpiMeta } from "@/lib/kpi-01/kpi-data"
import { getKpi01Data } from "@/lib/kpi-01/get-data"

export async function Kpi01Dashboard() {
  const { events, summary, categoryBreakdown, sourceBreakdown, cumulativeTimeline } = await getKpi01Data()

  return (
    <KpiPageShell
      icon={<ShieldAlert className="size-5" />}
      label={kpiMeta.id}
      title={kpiMeta.shortName}
      description={kpiMeta.name}
      actions={
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm font-medium text-muted-foreground">
          <CalendarDays className="size-4" aria-hidden="true" />
          Reporting Period: {kpiMeta.reportingPeriod}
        </div>
      }
    >
      <ResultBanner summary={summary} />
      <SummaryCards summary={summary} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CategoryChart data={categoryBreakdown} />
        <SourceChart summary={summary} sourceBreakdown={sourceBreakdown} />
      </div>
      <TrendChart data={cumulativeTimeline} />
      <EventTable events={events} />
    </KpiPageShell>
  )
}
