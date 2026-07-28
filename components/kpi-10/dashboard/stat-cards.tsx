import { AlertTriangle, ClipboardCheck, TrendingDown, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { kpiMeta, type CurrentPeriod } from "@/lib/kpi-10/kpi-data"
import { KpiStatCard, KpiStatGrid } from "@/components/portal/kpi-chrome"

type Stat = {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  tone: "success" | "neutral"
}

export function StatCards({ currentPeriod }: { currentPeriod: CurrentPeriod }) {
  const stats: Stat[] = [
    {
      label: "Events this period",
      value: String(currentPeriod.events),
      hint: `Fail threshold ≥ ${kpiMeta.threshold.fail}`,
      icon: AlertTriangle,
      tone: "success",
    },
    {
      label: "Damage points",
      value: String(currentPeriod.damagePoints),
      hint: `${kpiMeta.damagePointsPerEvent} per event`,
      icon: TrendingDown,
      tone: "success",
    },
    {
      label: "Personnel on-site",
      value: String(currentPeriod.personnelOnSite),
      hint: `${currentPeriod.compliantPersonnel} in approved uniform`,
      icon: Users,
      tone: "neutral",
    },
    {
      label: "Audits passed",
      value: "6 / 6",
      hint: "All zones inspected today",
      icon: ClipboardCheck,
      tone: "success",
    },
  ]

  return (
    <KpiStatGrid columns={4}>
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <KpiStatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            hint={stat.hint}
            valueClassName="font-mono"
            icon={<Icon className="size-5" aria-hidden="true" />}
            iconClassName={stat.tone === "success" ? "text-success" : "text-aviation"}
          />
        )
      })}
    </KpiStatGrid>
  )
}
