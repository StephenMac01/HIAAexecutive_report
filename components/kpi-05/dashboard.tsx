import { ShieldAlert } from "lucide-react"
import { KpiPageShell, KpiStatusBadge } from "@/components/portal/kpi-chrome"
import { SummaryCards } from "@/components/kpi-05/summary-cards"
import { KpiDefinition } from "@/components/kpi-05/kpi-definition"
import { EventsTrendChart } from "@/components/kpi-05/events-trend-chart"
import { TypeBreakdownChart } from "@/components/kpi-05/type-breakdown-chart"
import { UnitBreakdownChart } from "@/components/kpi-05/unit-breakdown-chart"
import { CumulativeDamageChart } from "@/components/kpi-05/cumulative-damage-chart"
import { EventLogTable } from "@/components/kpi-05/event-log-table"
import { getKpi05Data } from "@/lib/kpi-05/get-data"

export async function Kpi05Dashboard() {
  const { events, monthly, typeBreakdown, unitBreakdown, summary, damagePerEvent, thresholdTarget } =
    await getKpi05Data()

  return (
    <KpiPageShell
      icon={<ShieldAlert className="size-5" />}
      label="KPI-05"
      title="Untrained / Unqualified Personnel"
      description="Counts any untrained personnel working or unqualified personnel filling a post as one event, applying damage points against a zero-event target."
      dataSource="Reporting window Aug 2025 – Jul 2026 · driven by the source Excel workbook"
      actions={<KpiStatusBadge tone="neutral">Compliance Metric</KpiStatusBadge>}
    >
      <SummaryCards summary={summary} thresholdTarget={thresholdTarget} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EventsTrendChart data={monthly} />
        </div>
        <KpiDefinition />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <TypeBreakdownChart data={typeBreakdown} />
        <div className="lg:col-span-2">
          <UnitBreakdownChart data={unitBreakdown} />
        </div>
      </div>

      <CumulativeDamageChart data={monthly} />

      <EventLogTable events={events} damagePerEvent={damagePerEvent} />
    </KpiPageShell>
  )
}
