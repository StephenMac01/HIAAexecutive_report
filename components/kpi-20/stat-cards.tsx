import { AlertTriangle, CheckCircle2, ShieldAlert, Activity } from "lucide-react"
import { KpiStatCard, KpiStatGrid } from "@/components/portal/kpi-chrome"
import type { Threshold, ThresholdStatus, Totals } from "@/lib/kpi-20/kpi"

type StatCardsProps = {
  totals: Totals
  complianceRate: number
  status: ThresholdStatus
  threshold: Threshold
  damagePerEvent: number
}

export function StatCards({ totals, complianceRate, status, threshold, damagePerEvent }: StatCardsProps) {
  const eventsDanger = totals.totalEvents >= threshold.fail
  const damageDanger = totals.totalDamagePoints > 0
  const statusFail = status === "Fail"

  return (
    <KpiStatGrid cols={4}>
      <KpiStatCard
        label="Events (shifts below minimum)"
        value={String(totals.totalEvents)}
        icon={<AlertTriangle className="size-5" />}
        iconClassName={eventsDanger ? "text-destructive" : "text-chart-3"}
        valueClassName={eventsDanger ? "text-destructive" : undefined}
        hint={`Target is ${threshold.target} · Fail at ${threshold.fail}`}
      />
      <KpiStatCard
        label="Damage points"
        value={String(totals.totalDamagePoints)}
        icon={<ShieldAlert className="size-5" />}
        iconClassName={damageDanger ? "text-destructive" : "text-chart-3"}
        valueClassName={damageDanger ? "text-destructive" : undefined}
        hint={`${damagePerEvent} points per event`}
      />
      <KpiStatCard
        label="Compliant shifts"
        value={`${totals.compliantShifts} / ${totals.totalShifts}`}
        icon={<CheckCircle2 className="size-5" />}
        iconClassName="text-chart-3"
        hint={`${complianceRate.toFixed(1)}% of shifts met minimum`}
      />
      <KpiStatCard
        label="Threshold status"
        value={status}
        icon={<Activity className="size-5" />}
        iconClassName={statusFail ? "text-destructive" : "text-chart-3"}
        valueClassName={statusFail ? "text-destructive" : undefined}
        hint={statusFail ? "At least one shift below minimum" : "No shifts below minimum"}
      />
    </KpiStatGrid>
  )
}
