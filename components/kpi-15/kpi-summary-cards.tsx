import { AlertTriangle, Gauge, ShieldCheck, TriangleAlert } from "lucide-react"
import { KpiStatCard, KpiStatGrid } from "@/components/portal/kpi-chrome"
import type { KpiData } from "@/lib/kpi-15/kpi-data"
import { FAIL_THRESHOLD, TARGET } from "@/lib/kpi-15/kpi-data"

export function KpiSummaryCards({ data }: { data: KpiData }) {
  const { totals, fleetStats } = data
  const periodFail = totals.currentPeriodStatus === "Fail"

  return (
    <KpiStatGrid cols={4}>
      <KpiStatCard
        label={`Events — week ending ${totals.currentPeriodLabel}`}
        value={String(totals.currentPeriodEvents)}
        icon={periodFail ? <TriangleAlert className="size-5" /> : <ShieldCheck className="size-5" />}
        iconClassName={periodFail ? "text-destructive" : "text-chart-4"}
        valueClassName={periodFail ? "text-destructive" : "text-chart-4"}
        hint={periodFail ? `Above fail threshold of ${FAIL_THRESHOLD}` : `At or below target of ${TARGET}`}
      />
      <KpiStatCard
        label="Damage points (this week)"
        value={String(totals.currentPeriodEvents * 10)}
        icon={<Gauge className="size-5" />}
        iconClassName={totals.currentPeriodEvents > 0 ? "text-destructive" : "text-chart-4"}
        valueClassName={totals.currentPeriodEvents > 0 ? "text-destructive" : "text-chart-4"}
        hint="10 damage points per event"
      />
      <KpiStatCard
        label="Total events to date"
        value={String(totals.events)}
        icon={<AlertTriangle className="size-5" />}
        hint={`${totals.openEvents} open · ${totals.damagePoints} cumulative points`}
      />
      <KpiStatCard
        label="Fleet compliance"
        value={`${fleetStats.complianceRate}%`}
        icon={<ShieldCheck className="size-5" />}
        iconClassName={fleetStats.complianceRate === 100 ? "text-chart-4" : undefined}
        valueClassName={fleetStats.complianceRate === 100 ? "text-chart-4" : undefined}
        hint={`${fleetStats.compliant}/${fleetStats.total} vehicles compliant`}
      />
    </KpiStatGrid>
  )
}
