import { Truck } from "lucide-react"
import { KpiPageShell, KpiStatusBadge } from "@/components/portal/kpi-chrome"
import { KpiSpecCard } from "@/components/kpi-20/kpi-spec-card"
import { StatCards } from "@/components/kpi-20/stat-cards"
import { WeeklyTrendChart } from "@/components/kpi-20/weekly-trend-chart"
import { DriverDistributionChart } from "@/components/kpi-20/driver-distribution-chart"
import { EventsByShiftChart } from "@/components/kpi-20/events-by-shift-chart"
import { EventLogTable } from "@/components/kpi-20/event-log-table"
import { getDashboard } from "@/lib/kpi-20/kpi-data"

function formatRange(dateStr?: string) {
  if (!dateStr) return ""
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

export async function Kpi20Dashboard() {
  const data = await getDashboard()
  const isFail = data.status === "Fail"

  return (
    <KpiPageShell
      icon={<Truck className="size-5" />}
      label={data.kpi}
      title={data.title}
      description={`Reporting period ${formatRange(data.dateRange.start)} – ${formatRange(data.dateRange.end)}`}
      actions={
        <KpiStatusBadge tone={isFail ? "danger" : "success"}>{isFail ? "Fail" : "Target Met"}</KpiStatusBadge>
      }
      footer="KPI-20 · AVOP DA &amp; D Drivers — figures derived live from the shift log in the downloadable Excel workbook."
    >
      <section aria-label="Key metrics">
        <StatCards
          totals={data.totals}
          complianceRate={data.complianceRate}
          status={data.status}
          threshold={data.threshold}
          damagePerEvent={data.damagePerEvent}
        />
      </section>

      <section aria-label="Trends" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WeeklyTrendChart data={data.weeklyTrend} />
        <DriverDistributionChart data={data.driverDistribution} />
      </section>

      <section aria-label="Breakdown" className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <EventsByShiftChart data={data.eventsByShift} />
        </div>
        <div className="lg:col-span-3">
          <EventLogTable
            rows={data.eventRows}
            minimumRequired={data.minimumRequired}
            damagePerEvent={data.damagePerEvent}
          />
        </div>
      </section>

      <section aria-label="KPI definition" className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">KPI definition</h2>
        <KpiSpecCard
          kpi={data.kpi}
          title={data.title}
          threshold={data.threshold}
          damagePerEvent={data.damagePerEvent}
        />
      </section>
    </KpiPageShell>
  )
}
