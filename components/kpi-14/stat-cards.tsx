import { FileWarning, ShieldCheck, Clock, TrendingDown } from "lucide-react"
import type { KpiSummary } from "@/lib/kpi-14/kpi"
import { KPI } from "@/lib/kpi-14/kpi"
import { KpiStatCard, KpiStatGrid } from "@/components/portal/kpi-chrome"

export function StatCards({ summary }: { summary: KpiSummary }) {
  const cards = [
    {
      label: "Unauthorized Events",
      value: summary.unauthorized,
      sub: `Target: ${KPI.target}`,
      icon: FileWarning,
      accent: summary.unauthorized > KPI.target ? "text-destructive" : "text-success",
    },
    {
      label: "Damage Points",
      value: summary.damagePoints,
      sub: `${KPI.damagePerEvent} per event`,
      icon: TrendingDown,
      accent: summary.damagePoints > 0 ? "text-destructive" : "text-success",
    },
    {
      label: "Approved Changes",
      value: summary.approved,
      sub: "With written consent",
      icon: ShieldCheck,
      accent: "text-aviation",
    },
    {
      label: "Pending Review",
      value: summary.pending,
      sub: "Awaiting HIAA sign-off",
      icon: Clock,
      accent: "text-warning",
    },
  ]

  return (
    <KpiStatGrid columns={4}>
      {cards.map((c) => (
        <KpiStatCard
          key={c.label}
          label={c.label}
          value={c.value}
          hint={c.sub}
          icon={<c.icon className="size-5" />}
          iconClassName={c.accent}
          valueClassName={`font-mono ${c.accent}`}
        />
      ))}
    </KpiStatGrid>
  )
}
