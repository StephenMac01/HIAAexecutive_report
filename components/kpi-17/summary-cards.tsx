import { AlertTriangle, CircleAlert, FolderOpen, Target } from "lucide-react"
import { KpiStatCard, KpiStatGrid } from "@/components/portal/kpi-chrome"
import type { KpiData } from "@/lib/kpi-17/kpi"

export function SummaryCards({ data }: { data: KpiData }) {
  return (
    <KpiStatGrid cols={4} aria-label="KPI summary">
      <KpiStatCard
        label="Total Events (YTD)"
        value={data.totalEvents}
        icon={<AlertTriangle className="size-5" />}
        iconClassName={data.totalEvents > 0 ? "text-destructive" : "text-chart-5"}
        valueClassName={data.totalEvents > 0 ? "text-destructive" : "text-chart-5"}
        hint="Non-adherence events · target 0"
      />
      <KpiStatCard
        label="Damage Points"
        value={data.totalDamage}
        icon={<CircleAlert className="size-5" />}
        iconClassName="text-destructive"
        valueClassName="text-destructive"
        hint="25 points per event"
      />
      <KpiStatCard
        label="Open Events"
        value={data.openEvents}
        icon={<FolderOpen className="size-5" />}
        iconClassName={data.openEvents > 0 ? "text-accent" : "text-chart-5"}
        valueClassName={data.openEvents > 0 ? "text-accent" : "text-chart-5"}
        hint={`${data.closedEvents} closed / remediated`}
      />
      <KpiStatCard
        label="Months at Target"
        value={`${data.monthsMetTarget}/${data.monthsReported}`}
        icon={<Target className="size-5" />}
        iconClassName="text-chart-5"
        valueClassName="text-chart-5"
        hint="Reporting periods with 0 events"
      />
    </KpiStatGrid>
  )
}
