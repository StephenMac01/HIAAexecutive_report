import { AlertTriangle, TrendingDown, CalendarCheck, Gauge } from "lucide-react"
import { KpiStatCard, KpiStatGrid } from "@/components/portal/kpi-chrome"
import { DAMAGE_PER_EVENT, type KpiTotals } from "@/lib/kpi-18/kpi"

export function SummaryCards({ totals }: { totals: KpiTotals }) {
  const t = totals

  return (
    <KpiStatGrid cols={4}>
      <KpiStatCard
        label="Total failure events"
        value={t.totalEvents.toString()}
        icon={<AlertTriangle className="size-5" />}
        iconClassName="text-destructive"
        hint="Target: 0 events"
      />
      <KpiStatCard
        label="Damage points"
        value={t.damagePoints.toLocaleString()}
        icon={<Gauge className="size-5" />}
        iconClassName="text-destructive"
        hint={`${DAMAGE_PER_EVENT} points per event`}
      />
      <KpiStatCard
        label="Months on target"
        value={`${t.monthsOnTarget}/12`}
        icon={<CalendarCheck className="size-5" />}
        iconClassName="text-success"
        hint="Months with zero events"
      />
      <KpiStatCard
        label="Avg events / month"
        value={t.avgPerMonth.toFixed(1)}
        icon={<TrendingDown className="size-5" />}
        iconClassName="text-accent"
        hint="Trending down over 2025"
      />
    </KpiStatGrid>
  )
}
