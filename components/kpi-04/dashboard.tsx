import { ShieldAlert } from "lucide-react"
import { KpiPageShell, KpiStatusBadge } from "@/components/portal/kpi-chrome"
import { StatusHero } from "@/components/kpi-04/dashboard/status-hero"
import { StatCards } from "@/components/kpi-04/dashboard/stat-cards"
import { TrendChart } from "@/components/kpi-04/dashboard/trend-chart"
import { BreakdownChart } from "@/components/kpi-04/dashboard/breakdown-chart"
import { DefinitionCard } from "@/components/kpi-04/dashboard/definition-card"
import { EventLog } from "@/components/kpi-04/dashboard/event-log"
import { DataSourceNote } from "@/components/kpi-04/dashboard/data-source-note"
import { KPI } from "@/lib/kpi-04/kpi-data"
import { getDashboardData } from "@/lib/kpi-04/get-data"

export async function Kpi04Dashboard() {
  const data = await getDashboardData()

  return (
    <KpiPageShell
      icon={<ShieldAlert className="size-5" />}
      label={KPI.id}
      title={KPI.name}
      description="HIAA Security Services Contract — tracks unreported absent posts against a zero-event target, applying damage points for every late report or shortage without advance notice."
      dataSource={`Reporting period · ${data.currentPeriod.label} · driven by the source Excel workbook`}
      actions={
        <KpiStatusBadge tone={data.isCurrentPeriodPass ? "success" : "danger"}>
          {data.isCurrentPeriodPass ? "Pass" : "Fail"}
        </KpiStatusBadge>
      }
    >
      <StatusHero
        periodLabel={data.currentPeriod.label}
        eventCount={data.currentEventCount}
        damagePoints={data.currentDamagePoints}
        pass={data.isCurrentPeriodPass}
      />
      <StatCards
        ytdEvents={data.ytdEvents}
        ytdDamagePoints={data.ytdDamagePoints}
        compliantMonths={data.compliantMonths}
        months={data.monthlySeries.length}
        complianceRate={data.complianceRate}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <TrendChart data={data.monthlySeries} />
        <BreakdownChart breakdown={data.typeBreakdown} total={data.ytdEvents} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EventLog events={data.eventLog} />
        </div>
        <DefinitionCard />
      </div>
      <DataSourceNote totalRows={data.totalRows} />
    </KpiPageShell>
  )
}
