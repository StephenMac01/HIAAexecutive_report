import { KpiStatCard, KpiStatGrid } from "@/components/portal/kpi-chrome"
import { StatusBadge } from "@/components/kpi-21/status-badge"
import type { KpiSummary } from "@/lib/kpi-21/kpi"
import { TrendingDown, TrendingUp, Gauge, CalendarRange } from "lucide-react"

function pointsTone(net: number) {
  if (net > 0) return "text-success"
  if (net < 0) return "text-destructive"
  return "text-foreground"
}

export function SummaryCards({ summary }: { summary: KpiSummary }) {
  const { latest, avgFillRate, netPoints, totalAdvantage, totalDamage, months, countByStatus } = summary

  return (
    <KpiStatGrid columns={4}>
      <KpiStatCard label="Latest fill rate" icon={<Gauge className="size-5" />}>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold tabular-nums text-foreground">
            {latest ? `${latest.fillRate}%` : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{latest?.label ?? "No data"}</span>
          {latest ? <StatusBadge status={latest.status} /> : null}
        </div>
      </KpiStatCard>

      <KpiStatCard
        label="Average fill rate"
        icon={<CalendarRange className="size-5" />}
        value={`${avgFillRate}%`}
        hint={`Across ${months} month${months === 1 ? "" : "s"}`}
      />

      <KpiStatCard
        label="Net points"
        icon={netPoints >= 0 ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />}
        iconClassName={netPoints >= 0 ? "text-success" : "text-destructive"}
        value={`${netPoints > 0 ? "+" : ""}${netPoints}`}
        valueClassName={pointsTone(netPoints)}
        hint={
          <>
            <span className="text-success">+{totalAdvantage} adv</span> ·{" "}
            <span className="text-destructive">-{totalDamage} dmg</span>
          </>
        }
      />

      <KpiStatCard label="Months by status">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <StatusBadge status="success" />
            <span className="tabular-nums font-semibold text-foreground">{countByStatus.success}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <StatusBadge status="target" />
            <span className="tabular-nums font-semibold text-foreground">{countByStatus.target}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <StatusBadge status="fail" />
            <span className="tabular-nums font-semibold text-foreground">{countByStatus.fail}</span>
          </div>
        </div>
      </KpiStatCard>
    </KpiStatGrid>
  )
}
