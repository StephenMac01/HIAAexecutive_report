import { AlertTriangle, Target, Gauge, ShieldAlert } from "lucide-react"
import { kpiDefinition, complianceStatus, type Incident } from "@/lib/kpi-12/kpi-data"
import { KpiStatCard, KpiStatGrid } from "@/components/portal/kpi-chrome"

export function KpiSummaryCards({
  incidents,
  totalEvents,
  totalDamagePoints,
}: {
  incidents: Incident[]
  totalEvents: number
  totalDamagePoints: number
}) {
  const status = complianceStatus(totalEvents)
  const openItems = incidents.filter((i) => i.status !== "Resolved").length

  return (
    <KpiStatGrid columns={4}>
      <KpiStatCard
        icon={<AlertTriangle className="size-5" />}
        iconClassName="text-destructive"
        label="Total Events (YTD)"
        value={String(totalEvents)}
        hint={`Target: ${kpiDefinition.threshold.target} · Fail at ${kpiDefinition.threshold.fail}`}
      />
      <KpiStatCard
        icon={<ShieldAlert className="size-5" />}
        iconClassName="text-destructive"
        label="Damage Points"
        value={String(totalDamagePoints)}
        hint={`${kpiDefinition.damagePointsPerEvent} points per event`}
      />
      <KpiStatCard
        icon={<Gauge className="size-5" />}
        iconClassName={status === "Fail" ? "text-destructive" : "text-aviation"}
        label="Compliance Status"
        value={status}
        hint={status === "Fail" ? "Above fail threshold" : "Within target"}
        valueClassName={status === "Fail" ? "text-destructive" : undefined}
      />
      <KpiStatCard
        icon={<Target className="size-5" />}
        iconClassName="text-primary"
        label="Unresolved Items"
        value={String(openItems)}
        hint="Open or in review"
      />
    </KpiStatGrid>
  )
}
