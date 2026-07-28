import { AlertTriangle, Minus, CheckCircle2, Gauge } from "lucide-react"
import { KPI_META, type getTotals } from "@/lib/kpi-13/kpi-data"
import { KpiStatCard, KpiStatGrid } from "@/components/portal/kpi-chrome"

export function SummaryCards({ totals }: { totals: ReturnType<typeof getTotals> }) {
  const { totalEvents, totalDamagePoints, complianceRate, completed, totalScheduled } = totals

  const cards = [
    {
      label: "Events (Failures)",
      value: totalEvents.toString(),
      sub: `Target ${KPI_META.target} · Fail ≥ ${KPI_META.failThreshold}`,
      icon: AlertTriangle,
      danger: totalEvents > KPI_META.target,
    },
    {
      label: "Damage Points",
      value: totalDamagePoints.toString(),
      sub: `${KPI_META.damagePointsPerEvent} per event`,
      icon: Minus,
      danger: totalDamagePoints > 0,
    },
    {
      label: "Compliance Rate",
      value: `${complianceRate.toFixed(1)}%`,
      sub: `${completed.toLocaleString()} of ${totalScheduled.toLocaleString()} briefings`,
      icon: Gauge,
      danger: false,
    },
    {
      label: "Briefings Completed",
      value: completed.toLocaleString(),
      sub: `${totalScheduled.toLocaleString()} scheduled`,
      icon: CheckCircle2,
      danger: false,
    },
  ] as const

  return (
    <KpiStatGrid columns={4}>
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <KpiStatCard
            key={c.label}
            label={c.label}
            value={c.value}
            hint={c.sub}
            icon={<Icon className="size-5" aria-hidden="true" />}
            iconClassName={c.danger ? "text-destructive" : "text-aviation"}
            valueClassName={c.danger ? "text-destructive" : undefined}
          />
        )
      })}
    </KpiStatGrid>
  )
}
