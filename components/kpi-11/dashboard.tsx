import { Plane, CheckCircle2 } from "lucide-react"
import { KpiPageShell } from "@/components/portal/kpi-chrome"
import { KpiSpecCard } from "@/components/kpi-11/kpi-spec-card"
import { SummaryCards } from "@/components/kpi-11/summary-cards"
import { EventsChart } from "@/components/kpi-11/events-chart"
import { MonthlyTable } from "@/components/kpi-11/monthly-table"
import { kpiSpec } from "@/lib/kpi-11/kpi-data"
import { getKpi11Data } from "@/lib/kpi-11/get-data"

export async function Kpi11Dashboard() {
  const { monthlyData, summary } = await getKpi11Data()
  const atTarget = summary.totalEvents <= kpiSpec.threshold.target

  return (
    <KpiPageShell
      icon={<Plane className="size-5" />}
      label={`${kpiSpec.id} • Performance Dashboard`}
      title={kpiSpec.title}
    >
      {/* Status banner */}
      <div
        className={`flex items-center gap-3 rounded-xl border p-4 ${
          atTarget
            ? "border-success/30 bg-success/10 text-success"
            : "border-destructive/30 bg-destructive/10 text-destructive"
        }`}
      >
        <CheckCircle2 className="size-6 shrink-0" />
        <div className="flex flex-col">
          <span className="font-semibold">{atTarget ? "Target Met — Full Compliance" : "Threshold Breached"}</span>
          <span className="text-sm text-foreground/70">
            {summary.totalEvents} non-compliance events across {summary.monthsReported} reporting months, resulting in{" "}
            {summary.totalDamagePoints} damage points. This is the best-case scenario for {kpiSpec.id}.
          </span>
        </div>
      </div>

      <SummaryCards summary={summary} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <EventsChart monthlyData={monthlyData} />
        </div>
        <div className="lg:col-span-2">
          <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold text-card-foreground">Scenario Notes</h2>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                Every reporting month recorded 0 non-compliance events, meeting the Target of {kpiSpec.threshold.target}.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                No damage points accrued ({kpiSpec.damagePointsPerEvent} would apply per event).
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                {summary.totalDirectivesAudited} directives audited at a {summary.complianceRate}% compliance rate.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <MonthlyTable monthlyData={monthlyData} summary={summary} />

      {/* Reference spec */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">KPI Definition</h2>
        <KpiSpecCard />
      </section>
    </KpiPageShell>
  )
}
