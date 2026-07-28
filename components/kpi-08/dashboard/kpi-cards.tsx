import { ArrowDownRight, ArrowUpRight, CircleCheck, ClipboardList, ShieldAlert, TrendingUp } from "lucide-react"
import { KpiStatCard, KpiStatGrid } from "@/components/portal/kpi-chrome"
import { bandMeta, type PatrolSummary, type TrendPoint } from "@/lib/kpi-08/kpi-data"
import { cn } from "@/lib/utils"

export function KpiCards({
  complianceTrend,
  patrolSummary,
}: {
  complianceTrend: TrendPoint[]
  patrolSummary: PatrolSummary
}) {
  const netPoints = complianceTrend.reduce((sum, d) => sum + d.points, 0)
  const rateDelta = Math.round((patrolSummary.complianceRate - patrolSummary.previousRate) * 10) / 10
  const positive = rateDelta >= 0
  const Arrow = positive ? ArrowUpRight : ArrowDownRight

  return (
    <KpiStatGrid columns={4}>
      <KpiStatCard
        label="Compliance Rate"
        icon={<TrendingUp className="size-5" />}
        value={`${patrolSummary.complianceRate}%`}
        hint={
          <span className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
                positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
              )}
            >
              <Arrow className="size-3" aria-hidden="true" />
              {Math.abs(rateDelta)} pts
            </span>
            <span className="text-muted-foreground">
              {bandMeta[patrolSummary.band].label} band · vs. last period
            </span>
          </span>
        }
      />
      <KpiStatCard
        label="Patrols Completed"
        icon={<CircleCheck className="size-5" />}
        value={patrolSummary.completed.toLocaleString()}
        hint={`of ${patrolSummary.scheduled.toLocaleString()} scheduled`}
      />
      <KpiStatCard
        label="Missed Patrols"
        icon={<ShieldAlert className="size-5" />}
        iconClassName="text-destructive"
        value={patrolSummary.missed.toLocaleString()}
        hint="this reporting period"
      />
      <KpiStatCard
        label="Net Points (12 mo.)"
        icon={<ClipboardList className="size-5" />}
        value={netPoints > 0 ? `+${netPoints}` : `${netPoints}`}
        hint={netPoints >= 0 ? "advantage points" : "damage points"}
      />
    </KpiStatGrid>
  )
}
