import { AlertTriangle, CheckCircle2, Clock, ShieldAlert, Target } from "lucide-react"
import { KpiStatCard } from "@/components/portal/kpi-chrome"
import { KPI, type KpiDataset } from "@/lib/kpi-06/kpi-data"
import { cn } from "@/lib/utils"

function Trend({ value, invert }: { value: number; invert?: boolean }) {
  if (value === 0) return <span className="text-muted-foreground">no change vs prior period</span>
  const good = invert ? value < 0 : value > 0
  return (
    <span className={cn(good ? "text-success" : "text-destructive")}>
      {value > 0 ? "+" : ""}
      {value} vs prior period
    </span>
  )
}

export function StatCards({ data }: { data: KpiDataset }) {
  const { current, previous: prev, totals, totalOnTimeRate, totalAccuracyRate, cleanWeeks, weeks } = data
  const failing = current.status === "fail"

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      <KpiStatCard
        label="Current Period Status"
        icon={failing ? <ShieldAlert className="size-5" /> : <Target className="size-5" />}
        iconClassName={failing ? "text-destructive" : "text-success"}
        value={failing ? "Fail" : "On Target"}
        valueClassName={cn("text-2xl", failing ? "text-destructive" : "text-success")}
        hint={`Target ${KPI.target} · Fail at ${KPI.failThreshold} event${KPI.failThreshold === 1 ? "" : "s"}`}
      />
      <KpiStatCard
        label="Events This Period"
        icon={<AlertTriangle className="size-5" />}
        iconClassName={current.events > 0 ? "text-destructive" : undefined}
        value={String(current.events)}
        valueClassName={cn("text-2xl", current.events > 0 && "text-destructive")}
        hint={<Trend value={current.events - prev.events} invert />}
      />
      <KpiStatCard
        label="Damage Points"
        icon={<ShieldAlert className="size-5" />}
        iconClassName={current.damagePoints > 0 ? "text-destructive" : undefined}
        value={String(current.damagePoints)}
        valueClassName={cn("text-2xl", current.damagePoints > 0 && "text-destructive")}
        hint={`${KPI.damagePerEvent} points per event`}
      />
      <KpiStatCard
        label="On-Time Rate (26 wk)"
        icon={<Clock className="size-5" />}
        value={`${totalOnTimeRate.toFixed(1)}%`}
        valueClassName="text-2xl"
        hint={`${totals.late} late invoice${totals.late === 1 ? "" : "s"} of ${totals.invoices}`}
      />
      <KpiStatCard
        label="Accuracy Rate (26 wk)"
        icon={<CheckCircle2 className="size-5" />}
        value={`${totalAccuracyRate.toFixed(1)}%`}
        valueClassName="text-2xl"
        hint={`${totals.incorrect} flagged · ${totals.notRectified} unrectified`}
      />
      <KpiStatCard
        label="Clean Weeks"
        icon={<Target className="size-5" />}
        value={`${cleanWeeks}/${weeks.length}`}
        valueClassName="text-2xl"
        hint={`${totals.events} total events · ${totals.damagePoints} damage points`}
      />
    </div>
  )
}
