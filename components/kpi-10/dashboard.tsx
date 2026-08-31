import { ShieldCheck } from "lucide-react"
import { KpiPageShell } from "@/components/portal/kpi-chrome"
import { StatusBanner } from "@/components/kpi-10/dashboard/status-banner"
import { StatCards } from "@/components/kpi-10/dashboard/stat-cards"
import { KpiDefinition } from "@/components/kpi-10/dashboard/kpi-definition"
import { ComplianceChart } from "@/components/kpi-10/dashboard/compliance-chart"
import { ZoneBreakdown } from "@/components/kpi-10/dashboard/zone-breakdown"
import { AuditLog } from "@/components/kpi-10/dashboard/audit-log"
import { kpiMeta } from "@/lib/kpi-10/kpi-data"
import { getKpi10Data } from "@/lib/kpi-10/get-data"

export async function Kpi10Dashboard() {
  const { dailyEvents, currentPeriod } = await getKpi10Data()
  return (
    <KpiPageShell
      icon={<ShieldCheck className="size-5" />}
      label={`${kpiMeta.id} · Uniform Compliance`}
      title={`${kpiMeta.name} Compliance`}
      description="HIAA approved uniform monitoring across on-site personnel."
      actions={
        <dl className="flex items-center gap-6 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Reporting period</dt>
            <dd className="font-medium text-foreground">{kpiMeta.reportingPeriod}</dd>
          </div>
          <div className="hidden sm:block">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Last audit</dt>
            <dd className="font-medium text-foreground">{kpiMeta.lastAudit}</dd>
          </div>
        </dl>
      }
    >
      <StatusBanner currentPeriod={currentPeriod} />
      <StatCards currentPeriod={currentPeriod} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ComplianceChart dailyEvents={dailyEvents} />
        </div>
        <ZoneBreakdown />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <KpiDefinition />
        </div>
        <AuditLog />
      </div>
    </KpiPageShell>
  )
}
