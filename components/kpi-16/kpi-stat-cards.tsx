import { AlertTriangle, Ambulance, Clock, Gauge, Timer } from "lucide-react"
import { KpiStatCard, KpiStatGrid } from "@/components/portal/kpi-chrome"
import type { KpiTotals } from "@/lib/kpi-16/kpi-data"
import { KPI_META } from "@/lib/kpi-16/kpi-data"

export function KpiStatCards({ totals }: { totals: KpiTotals }) {
  return (
    <KpiStatGrid cols={5} aria-label="Key metrics">
      <KpiStatCard
        label="Total Incidents"
        value={totals.totalIncidents.toLocaleString()}
        icon={<Clock className="size-5" />}
        hint={`${totals.emergencyIncidents} emergency · ${totals.nonEmergencyIncidents} non-emergency`}
      />
      <KpiStatCard
        label="Breach Events"
        value={String(totals.totalEvents)}
        icon={<AlertTriangle className="size-5" />}
        iconClassName={totals.totalEvents > 0 ? "text-destructive" : "text-[var(--chart-2)]"}
        valueClassName={totals.totalEvents > 0 ? "text-destructive" : "text-[var(--chart-2)]"}
        hint={`Target ${KPI_META.threshold.target} · each failure = 1 event`}
      />
      <KpiStatCard
        label="Damage Points"
        value={String(totals.damagePoints)}
        icon={<Gauge className="size-5" />}
        iconClassName={totals.damagePoints > 0 ? "text-destructive" : "text-[var(--chart-2)]"}
        valueClassName={totals.damagePoints > 0 ? "text-destructive" : "text-[var(--chart-2)]"}
        hint={`${KPI_META.damagePointsPerEvent} points per event`}
      />
      <KpiStatCard
        label="Emergency Compliance"
        value={`${totals.emergencyCompliancePct}%`}
        icon={<Ambulance className="size-5" />}
        iconClassName="text-[var(--chart-2)]"
        valueClassName="text-[var(--chart-2)]"
        hint={`Within ${KPI_META.emergencyTargetMinutes} min · ${totals.emergencyEvents} breach(es)`}
      />
      <KpiStatCard
        label="Non-Emergency Compliance"
        value={`${totals.nonEmergencyCompliancePct}%`}
        icon={<Timer className="size-5" />}
        iconClassName="text-[var(--chart-2)]"
        valueClassName="text-[var(--chart-2)]"
        hint={`Within ${KPI_META.nonEmergencyTargetMinutes} min · ${totals.nonEmergencyEvents} breach(es)`}
      />
    </KpiStatGrid>
  )
}
