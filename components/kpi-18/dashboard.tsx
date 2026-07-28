import { ShieldAlert } from "lucide-react"
import { KpiPageShell, KpiStatusBadge } from "@/components/portal/kpi-chrome"
import { SummaryCards } from "@/components/kpi-18/summary-cards"
import { KpiSpecCard } from "@/components/kpi-18/kpi-spec-card"
import { TrendChart } from "@/components/kpi-18/trend-chart"
import { LeadChart } from "@/components/kpi-18/lead-chart"
import { BreakdownChart } from "@/components/kpi-18/breakdown-chart"
import { EventsTable } from "@/components/kpi-18/events-table"
import { getKpi18Data } from "@/lib/kpi-18/get-data"

export async function Kpi18Dashboard() {
  const { totals, trend, byLead, byType, bySite, recentEvents } = await getKpi18Data()

  return (
    <KpiPageShell
      icon={<ShieldAlert className="size-5" />}
      label="KPI-18"
      title="Team Lead failure to report to HIAA Duty Security Manager"
      description="Reporting period 2025 · Each failure to report a security or regulatory incident to the DSM counts as one event."
      actions={
        <KpiStatusBadge tone={totals.status === "Fail" ? "danger" : "success"}>
          {totals.status === "Fail" ? "Below Target" : "On Target"}
        </KpiStatusBadge>
      }
      footer="KPI-18 · HIAA Security Performance · Source data available as Excel via the download button. Figures are illustrative sample data."
    >
      <SummaryCards totals={totals} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendChart data={trend} />
        </div>
        <KpiSpecCard />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LeadChart data={byLead} />
        <BreakdownChart
          title="Events by incident type"
          description="Security vs. regulatory incidents left unreported"
          data={byType}
        />
      </div>

      <BreakdownChart
        title="Events by location"
        description="Where unreported incidents originated across HIAA"
        data={bySite}
      />

      <EventsTable events={recentEvents} />
    </KpiPageShell>
  )
}
