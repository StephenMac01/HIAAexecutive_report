import { AlertTriangle, TrendingDown, TrendingUp, Gauge, Clock } from "lucide-react"
import { KpiStatCard, KpiStatGrid } from "@/components/portal/kpi-chrome"
import { kpi, type Kpi19Summary } from "@/lib/kpi-19/kpi-data"

export function SummaryCards({ summary }: { summary: Kpi19Summary }) {
  const s = summary

  return (
    <KpiStatGrid cols={4}>
      <KpiStatCard
        label="Total Events"
        value={s.totalEvents.toString()}
        icon={<AlertTriangle className="size-5" />}
        iconClassName="text-destructive"
        hint={`Target: ${kpi.thresholdTarget} · Fail at ${kpi.thresholdFail}`}
      />
      <KpiStatCard
        label="Damage Points"
        value={s.damagePoints.toString()}
        icon={<Gauge className="size-5" />}
        iconClassName="text-primary"
        hint={`${kpi.damagePointsPerEvent} points per event`}
      />
      <KpiStatCard
        label="Latest Month"
        value={s.latestCount.toString()}
        icon={s.delta > 0 ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />}
        iconClassName={s.delta > 0 ? "text-destructive" : "text-emerald-600"}
        hint={s.delta === 0 ? "No change vs prior month" : `${s.delta > 0 ? "+" : ""}${s.delta} vs prior month`}
      />
      <KpiStatCard
        label="Pending Review"
        value={s.pending.toString()}
        icon={<Clock className="size-5" />}
        iconClassName="text-accent"
        hint="Reports awaiting verification"
      />
    </KpiStatGrid>
  )
}
