import { ShieldCheck, AlertTriangle, Gauge, CalendarCheck } from "lucide-react"
import type { ComponentType } from "react"
import { kpiSpec, type Summary } from "@/lib/kpi-11/kpi-data"
import { KpiStatCard, KpiStatGrid } from "@/components/portal/kpi-chrome"

type Stat = {
  label: string
  value: string
  sub: string
  icon: ComponentType<{ className?: string }>
  iconClassName: string
}

export function SummaryCards({ summary }: { summary: Summary }) {
  const atTarget = summary.totalEvents <= kpiSpec.threshold.target

  const stats: Stat[] = [
    {
      label: "Non-Compliance Events",
      value: String(summary.totalEvents),
      sub: `Target ${kpiSpec.threshold.target} • ${atTarget ? "Target met" : "Above threshold"}`,
      icon: atTarget ? ShieldCheck : AlertTriangle,
      iconClassName: atTarget ? "text-success" : "text-aviation",
    },
    {
      label: "Damage Points",
      value: String(summary.totalDamagePoints),
      sub: `${kpiSpec.damagePointsPerEvent} per event • ${summary.totalEvents} events`,
      icon: Gauge,
      iconClassName: "text-navy dark:text-primary",
    },
    {
      label: "Compliance Rate",
      value: `${summary.complianceRate}%`,
      sub: `${summary.totalDirectivesAudited} directives audited`,
      icon: ShieldCheck,
      iconClassName: "text-aviation",
    },
    {
      label: "Compliance Streak",
      value: `${summary.complianceStreak} mo`,
      sub: `${summary.monthsAtTarget}/${summary.monthsReported} months at target`,
      icon: CalendarCheck,
      iconClassName: "text-success",
    },
  ]

  return (
    <KpiStatGrid columns={4}>
      {stats.map(({ label, value, sub, icon: Icon, iconClassName }) => (
        <KpiStatCard
          key={label}
          label={label}
          value={value}
          hint={sub}
          icon={<Icon className="size-5" />}
          iconClassName={iconClassName}
        />
      ))}
    </KpiStatGrid>
  )
}
