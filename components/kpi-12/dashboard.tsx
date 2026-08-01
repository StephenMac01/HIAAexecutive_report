import { Languages } from "lucide-react"
import { KpiPageShell, KpiStatusBadge } from "@/components/portal/kpi-chrome"
import { KpiSummaryCards } from "@/components/kpi-12/kpi-summary-cards"
import { KpiDefinitionCard } from "@/components/kpi-12/kpi-definition-card"
import { KpiCharts } from "@/components/kpi-12/kpi-charts"
import { IncidentTable } from "@/components/kpi-12/incident-table"
import { complianceStatus } from "@/lib/kpi-12/kpi-data"
import { getKpi12Data } from "@/lib/kpi-12/get-data"

export async function Kpi12Dashboard() {
  const data = await getKpi12Data()
  const status = complianceStatus(data.totalEvents)

  return (
    <KpiPageShell
      icon={<Languages className="size-5" />}
      label="KPI-12 · OLA"
      title="Official Languages Act — Contract Compliance"
      description="Year-to-date monitoring of Official Languages Act non-compliance events across the contract."
      actions={
        <KpiStatusBadge tone={status === "Fail" ? "danger" : "success"}>
          {status === "Fail" ? "Non-compliant" : "On target"}
        </KpiStatusBadge>
      }
    >
      <section aria-labelledby="overview-heading" className="flex flex-col gap-4">
        <div>
          <h2 id="overview-heading" className="text-lg font-semibold text-foreground">
            Performance Overview
          </h2>
          <p className="text-sm text-muted-foreground">
            Year-to-date summary of Official Languages Act non-compliance events.
          </p>
        </div>
        <KpiSummaryCards
          incidents={data.incidents}
          totalEvents={data.totalEvents}
          totalDamagePoints={data.totalDamagePoints}
        />
      </section>

      <section aria-labelledby="trends-heading" className="flex flex-col gap-4">
        <div>
          <h2 id="trends-heading" className="text-lg font-semibold text-foreground">
            Trends &amp; Distribution
          </h2>
          <p className="text-sm text-muted-foreground">
            How events track against target across time, status, and category.
          </p>
        </div>
        <KpiCharts
          monthlyEvents={data.monthlyEvents}
          eventsByCategory={data.eventsByCategory}
          statusBreakdown={data.statusBreakdown}
        />
      </section>

      <section aria-labelledby="log-heading" className="flex flex-col gap-4">
        <h2 id="log-heading" className="sr-only">
          Incident Log
        </h2>
        <IncidentTable incidents={data.incidents} />
      </section>

      <section aria-labelledby="def-heading" className="flex flex-col gap-4">
        <div>
          <h2 id="def-heading" className="text-lg font-semibold text-foreground">
            KPI Definition
          </h2>
          <p className="text-sm text-muted-foreground">
            Reference specification for KPI-12 as defined in the service level agreement.
          </p>
        </div>
        <KpiDefinitionCard />
      </section>
    </KpiPageShell>
  )
}
