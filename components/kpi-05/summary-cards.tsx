import { AlertTriangle, CalendarClock, Crosshair, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { KpiStatCard, KpiStatGrid, KpiStatusBadge } from "@/components/portal/kpi-chrome"
import type { KpiSummary } from "@/lib/kpi-05/kpi-types"

export function SummaryCards({
  summary,
  thresholdTarget,
}: {
  summary: KpiSummary
  thresholdTarget: number
}) {
  const isFail = summary.status === "Fail"
  const delta = summary.currentMonthEvents - summary.previousMonthEvents

  return (
    <KpiStatGrid columns={4}>
      <KpiStatCard
        label="Total events"
        icon={<AlertTriangle className="size-5" />}
        iconClassName={isFail ? "text-destructive" : undefined}
      >
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold tabular-nums text-foreground">{summary.totalEvents}</span>
          <span className="pb-1 text-sm text-muted-foreground">/ target {thresholdTarget}</span>
        </div>
        <KpiStatusBadge tone={isFail ? "danger" : "success"} className="mt-1 w-fit">
          {isFail ? "Threshold breached" : "Target met"}
        </KpiStatusBadge>
      </KpiStatCard>

      <KpiStatCard
        label="Damage points"
        icon={<Zap className="size-5" />}
        iconClassName="text-warning"
        value={summary.damagePoints}
        hint={`25 pts × ${summary.totalEvents} events`}
      />

      <KpiStatCard label="This month" icon={<Crosshair className="size-5" />}>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold tabular-nums text-foreground">{summary.currentMonthEvents}</span>
          <span className="pb-1 text-sm text-muted-foreground">events</span>
        </div>
        <span
          className={cn(
            "text-xs font-medium",
            delta > 0 ? "text-destructive" : delta < 0 ? "text-success" : "text-muted-foreground",
          )}
        >
          {delta > 0 ? `+${delta}` : delta} vs. last month
        </span>
      </KpiStatCard>

      <KpiStatCard
        label="Days since last event"
        icon={<CalendarClock className="size-5" />}
        value={summary.daysSinceLastEvent}
        hint={`Most affected: ${summary.worstUnit}`}
      />
    </KpiStatGrid>
  )
}
