import { AlertTriangle, CalendarCheck, Coins, Target } from "lucide-react"
import { KpiStatCard, KpiStatGrid } from "@/components/portal/kpi-chrome"
import { KPI_META, type Kpi07Summary } from "@/lib/kpi-07/kpi-data"

export function KpiSummaryCards({ summary }: { summary: Kpi07Summary }) {
  const { totalIncidents, totalDamagePoints, daysSinceLastIncident, complianceRate } = summary
  return (
    <KpiStatGrid columns={4}>
      <KpiStatCard
        label="Incidents vs Target"
        icon={<AlertTriangle className="size-5" />}
        iconClassName={totalIncidents > KPI_META.target ? "text-destructive" : "text-success"}
        value={`${totalIncidents}`}
        valueClassName={totalIncidents > KPI_META.target ? "text-destructive" : "text-success"}
        hint={`Target ${KPI_META.target} — ${totalIncidents > KPI_META.target ? "exceeded" : "met"}`}
      />
      <KpiStatCard
        label="Total Damage Points"
        icon={<Coins className="size-5" />}
        iconClassName={totalDamagePoints > 0 ? "text-destructive" : "text-success"}
        value={`${totalDamagePoints}`}
        valueClassName={totalDamagePoints > 0 ? "text-destructive" : "text-success"}
        hint={`${KPI_META.damagePointsPerEvent} points × ${totalIncidents} events`}
      />
      <KpiStatCard
        label="Days Since Last Incident"
        icon={<CalendarCheck className="size-5" />}
        value={`${daysSinceLastIncident}`}
        hint="Most recent confirmed event"
      />
      <KpiStatCard
        label="Compliant Months"
        icon={<Target className="size-5" />}
        iconClassName={complianceRate === 100 ? "text-success" : "text-primary"}
        value={`${complianceRate}%`}
        hint="Months with zero incidents"
      />
    </KpiStatGrid>
  )
}
