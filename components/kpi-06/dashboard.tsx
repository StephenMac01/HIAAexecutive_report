import { FileText } from "lucide-react"
import { KpiPageShell, KpiStatusBadge } from "@/components/portal/kpi-chrome"
import { StatCards } from "@/components/kpi-06/dashboard/stat-cards"
import { EventsTrendChart } from "@/components/kpi-06/dashboard/events-trend-chart"
import { EventBreakdownChart } from "@/components/kpi-06/dashboard/event-breakdown-chart"
import { ComplianceChart } from "@/components/kpi-06/dashboard/compliance-chart"
import { AtRiskInvoices } from "@/components/kpi-06/dashboard/at-risk-invoices"
import { KpiDefinition } from "@/components/kpi-06/dashboard/kpi-definition"
import { loadKpiDataset } from "@/lib/kpi-06/get-data"
import { KPI } from "@/lib/kpi-06/kpi-data"

export async function Kpi06Dashboard() {
  const data = await loadKpiDataset()
  const failing = data.current.status === "fail"

  return (
    <KpiPageShell
      icon={<FileText className="size-5" />}
      label={`${KPI.id} · Service Level KPI`}
      title={`${KPI.name} Performance`}
      description="Contractor to HIAA — timeliness, accuracy, and rectification of invoiced hours."
      dataSource={`Current period · ${data.current.period} · driven by the source Excel workbook`}
      actions={
        <KpiStatusBadge tone={failing ? "danger" : "success"}>{failing ? "Fail" : "On Target"}</KpiStatusBadge>
      }
    >
      <StatCards data={data} />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EventsTrendChart weeks={data.weeks} />
        </div>
        <div>
          <EventBreakdownChart totals={data.totals} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ComplianceChart weeks={data.weeks} />
        </div>
        <div>
          <KpiDefinition />
        </div>
      </section>

      <AtRiskInvoices openInvoices={data.openInvoices} />
    </KpiPageShell>
  )
}
