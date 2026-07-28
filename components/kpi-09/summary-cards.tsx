import { AlertTriangle, CalendarClock, CheckCircle2, TrendingDown } from "lucide-react"
import { DAMAGE_POINTS_PER_EVENT, type TimelinessData } from "@/lib/kpi-09/kpi-data"
import { KpiStatCard, KpiStatGrid } from "@/components/portal/kpi-chrome"

export function SummaryCards({
  period,
  ytd,
}: {
  period: TimelinessData["period"]
  ytd: TimelinessData["ytd"]
}) {
  return (
    <KpiStatGrid columns={4}>
      <KpiStatCard
        label={`Events (${period.label})`}
        value={String(period.events)}
        hint="Target: 0 · Fail at 1"
        icon={<AlertTriangle className="size-5" />}
        valueClassName={period.events >= 1 ? "text-destructive" : "text-success"}
      />
      <KpiStatCard
        label="Damage points"
        value={String(period.damagePoints)}
        hint={`${DAMAGE_POINTS_PER_EVENT} per event · advantage n/a`}
        icon={<TrendingDown className="size-5" />}
        valueClassName={period.damagePoints > 0 ? "text-destructive" : "text-success"}
      />
      <KpiStatCard
        label="On-time delivery"
        value={`${period.onTimeRate}%`}
        hint={`${period.onTime} of ${period.delivered} delivered on time`}
        icon={<CheckCircle2 className="size-5" />}
        valueClassName="text-aviation"
      />
      <KpiStatCard
        label="YTD events"
        value={String(ytd.events)}
        hint={`${ytd.damagePoints} damage points across ${ytd.periods} periods`}
        icon={<CalendarClock className="size-5" />}
        valueClassName={ytd.events > 0 ? "text-destructive" : "text-success"}
      />
    </KpiStatGrid>
  )
}
