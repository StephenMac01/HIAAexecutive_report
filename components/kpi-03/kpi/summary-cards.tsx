import { Progress } from "@/components/ui/progress"
import { KpiStatCard, KpiStatGrid } from "@/components/portal/kpi-chrome"
import { KPI_META, type Kpi03Summary } from "@/lib/kpi-03/kpi-data"
import { Target, TriangleAlert, Gauge, CalendarCheck } from "lucide-react"

export function SummaryCards({ summary }: { summary: Kpi03Summary }) {
  const complianceRate = Math.round((summary.compliantMonths / summary.totalMonths) * 100)
  return (
    <KpiStatGrid columns={4}>
      <KpiStatCard
        label="Occurrences (YTD)"
        value={String(summary.totalOccurrences)}
        hint={`Target: ${KPI_META.threshold.target} · Fail at ${KPI_META.threshold.fail}`}
        icon={<TriangleAlert className="size-5" />}
        iconClassName="text-destructive"
      />
      <KpiStatCard
        label="Damage Points"
        value={String(summary.totalDamagePoints)}
        hint={`${KPI_META.damagePointsPerEvent} points per event`}
        icon={<Gauge className="size-5" />}
        iconClassName="text-warning"
      />
      <KpiStatCard
        label="Target"
        value={String(KPI_META.threshold.target)}
        hint="Zero below-minimum events"
        icon={<Target className="size-5" />}
        iconClassName="text-primary"
      />
      <KpiStatCard label="Compliant Months" icon={<CalendarCheck className="size-5" />} iconClassName="text-success">
        <span className="text-3xl font-bold tabular-nums text-foreground">
          {summary.compliantMonths}/{summary.totalMonths}
        </span>
        <span className="text-xs text-muted-foreground">{complianceRate}% of reporting period</span>
        <Progress value={complianceRate} className="mt-1 h-1.5" />
      </KpiStatCard>
    </KpiStatGrid>
  )
}
