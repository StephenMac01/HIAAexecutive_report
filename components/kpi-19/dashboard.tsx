import { ShieldAlert } from "lucide-react"
import { KpiPageShell, KpiStatusBadge } from "@/components/portal/kpi-chrome"
import { SummaryCards } from "@/components/kpi-19/summary-cards"
import { TrendChart } from "@/components/kpi-19/trend-chart"
import { PostBreakdownChart, TypeBreakdownChart } from "@/components/kpi-19/breakdown-charts"
import { SpecPanel } from "@/components/kpi-19/spec-panel"
import { EventsTable } from "@/components/kpi-19/events-table"
import { kpi } from "@/lib/kpi-19/kpi-data"
import { getKpi19Data } from "@/lib/kpi-19/get-data"

export async function Kpi19Dashboard() {
  const { events, summary, trend, byPost, byType } = await getKpi19Data()
  const failing = summary.status === "Fail"

  return (
    <KpiPageShell
      icon={<ShieldAlert className="size-5" />}
      label={`${kpi.id} · HIAA Security Performance`}
      title={kpi.name}
      actions={
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Compliance Status</span>
          <KpiStatusBadge tone={failing ? "danger" : "success"}>
            {failing ? "Fail — Threshold Breached" : "Target Met"}
          </KpiStatusBadge>
        </div>
      }
      footer="HIAA Security Performance · KPI-19 On Shift Distractions · Sample data provided in the downloadable workbook."
    >
      <SummaryCards summary={summary} />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TrendChart data={trend} />
        <SpecPanel />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PostBreakdownChart data={byPost} />
        <TypeBreakdownChart data={byType} />
      </section>

      <EventsTable events={events} />
    </KpiPageShell>
  )
}
