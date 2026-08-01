import { Car } from "lucide-react"
import { getKpiData } from "@/lib/kpi-15/get-data"
import { KpiPageShell, KpiStatusBadge } from "@/components/portal/kpi-chrome"
import { KpiSummaryCards } from "@/components/kpi-15/kpi-summary-cards"
import { KpiDefinitionCard } from "@/components/kpi-15/kpi-definition-card"
import { EventsTrendChart } from "@/components/kpi-15/events-trend-chart"
import { DamagePointsChart } from "@/components/kpi-15/damage-points-chart"
import { EventBreakdownChart } from "@/components/kpi-15/event-breakdown-chart"
import { EventsTable } from "@/components/kpi-15/events-table"
import { FleetTable } from "@/components/kpi-15/fleet-table"

export async function Kpi15Dashboard() {
  const data = await getKpiData()
  const isFail = data.totals.currentPeriodStatus === "Fail"

  return (
    <KpiPageShell
      icon={<Car className="size-5" />}
      label="KPI-15"
      title="Vehicles"
      description="Contractor Vehicle Compliance · HIAA Performance Monitoring"
      actions={
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-muted-foreground">Week ending · {data.totals.currentPeriodLabel}</span>
          <KpiStatusBadge tone={isFail ? "danger" : "success"}>
            {isFail ? "Fail — action required" : "Meeting target"}
          </KpiStatusBadge>
        </div>
      }
      dataSource={
        <span>
          Data sourced from <span className="font-mono text-foreground">kpi-15-vehicles.xlsx</span> · Events, Fleet, KPI
          Definition &amp; How To Update sheets
        </span>
      }
      footer="KPI-15 · Vehicles — Contractor performance monitoring. Target 0 events per period · Fail at 1 event · 10 damage points per event."
    >
      <KpiSummaryCards data={data} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EventsTrendChart data={data.weekly} />
        </div>
        <div>
          <EventBreakdownChart data={data.breakdown} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DamagePointsChart data={data.weekly} />
        </div>
        <div>
          <KpiDefinitionCard />
        </div>
      </div>

      <EventsTable events={data.events} />
      <FleetTable fleet={data.fleet} />
    </KpiPageShell>
  )
}
