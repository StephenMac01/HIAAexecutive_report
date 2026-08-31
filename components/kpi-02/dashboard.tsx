import { MessageSquareHeart } from "lucide-react"
import { KpiPageShell, KpiStatusBadge } from "@/components/portal/kpi-chrome"
import { KpiScorecard } from "@/components/kpi-02/kpi-scorecard"
import { Kpi02Stats } from "@/components/kpi-02/kpi02-stats"
import { ComplimentsTrendChart } from "@/components/kpi-02/compliments-trend-chart"
import { SourceBreakdown } from "@/components/kpi-02/source-breakdown"
import { Kpi02SpecCard } from "@/components/kpi-02/kpi02-spec-card"
import { ComplimentEventsTable } from "@/components/kpi-02/compliment-events-table"
import { getKpi02Data } from "@/lib/kpi-02/get-data"

export async function Kpi02Dashboard() {
  const { events, monthly, sourceBreakdown, summary } = await getKpi02Data()

  return (
    <KpiPageShell
      icon={<MessageSquareHeart className="size-5" />}
      label="KPI-02"
      title="Customer Compliments"
      description="Counts each unsolicited customer compliment as one event across all intake sources, awarding advantage points once the period threshold is exceeded."
      dataSource="Reporting year 2025 · driven by the source Excel workbook"
      actions={<KpiStatusBadge tone="success">On Target</KpiStatusBadge>}
    >
      <Kpi02Stats summary={summary} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ComplimentsTrendChart data={monthly} />
        </div>
        <div>
          <SourceBreakdown data={sourceBreakdown} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Kpi02SpecCard summary={summary} />
        <ComplimentEventsTable events={events} />
      </div>

      <KpiScorecard />
    </KpiPageShell>
  )
}
