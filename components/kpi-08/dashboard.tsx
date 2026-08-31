import { ShieldCheck } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { KpiPageShell } from "@/components/portal/kpi-chrome"
import { KpiCards } from "@/components/kpi-08/dashboard/kpi-cards"
import { ComplianceTrendChart } from "@/components/kpi-08/dashboard/compliance-trend-chart"
import { OutcomeBreakdown } from "@/components/kpi-08/dashboard/outcome-breakdown"
import { ScoringReference } from "@/components/kpi-08/dashboard/scoring-reference"
import { SiteTable } from "@/components/kpi-08/dashboard/site-table"
import { getKpi08Data } from "@/lib/kpi-08/get-data"

export async function Kpi08Dashboard() {
  const { complianceTrend, patrolSummary, outcomeSplit, siteRecords } = await getKpi08Data()

  return (
    <KpiPageShell
      icon={<ShieldCheck className="size-5" />}
      label="KPI-08 · Patrol Compliance"
      title="Patrol Compliance"
      description="Completion rate of scheduled patrols across all sites, rated against the contractual compliance bands."
      dataSource="Driven by the source Excel workbook"
      actions={
        <Select defaultValue="month">
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This month</SelectItem>
            <SelectItem value="quarter">This quarter</SelectItem>
            <SelectItem value="ytd">Year to date</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <KpiCards complianceTrend={complianceTrend} patrolSummary={patrolSummary} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ComplianceTrendChart complianceTrend={complianceTrend} />
        <ScoringReference />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <OutcomeBreakdown outcomeSplit={outcomeSplit} />
        <div className="lg:col-span-2">
          <SiteTable siteRecords={siteRecords} />
        </div>
      </div>
    </KpiPageShell>
  )
}
