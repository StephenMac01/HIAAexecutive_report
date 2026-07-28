import { ShieldCheck, CalendarDays } from "lucide-react"
import { KpiPageShell, KpiStatusBadge } from "@/components/portal/kpi-chrome"
import { SummaryCards } from "@/components/kpi-13/dashboard/summary-cards"
import { WeeklyTrendChart } from "@/components/kpi-13/dashboard/weekly-trend-chart"
import { ShiftBreakdownChart } from "@/components/kpi-13/dashboard/shift-breakdown-chart"
import { TeamLeadBreakdown } from "@/components/kpi-13/dashboard/team-lead-breakdown"
import { EventLog } from "@/components/kpi-13/dashboard/event-log"
import { KpiDefinition } from "@/components/kpi-13/dashboard/kpi-definition"
import { loadBriefingEvents } from "@/lib/kpi-13/kpi-source"
import {
  KPI_META,
  getTotals,
  getEventsByShift,
  getEventsByTeamLead,
  getStatusBreakdown,
  getWeeklyTrend,
} from "@/lib/kpi-13/kpi-data"

export async function Kpi13Dashboard() {
  const events = await loadBriefingEvents()

  const totals = getTotals(events)
  const weekly = getWeeklyTrend(events)
  const byShift = getEventsByShift(events)
  const byStatus = getStatusBreakdown(events)
  const byLead = getEventsByTeamLead(events)

  return (
    <KpiPageShell
      icon={<ShieldCheck className="size-5" />}
      label={
        <span className="inline-flex items-center gap-2">
          {KPI_META.id}
          <span className="inline-flex items-center gap-1 normal-case tracking-normal">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {KPI_META.periodLabel}
          </span>
        </span>
      }
      title={KPI_META.name}
      description={KPI_META.contractor}
      actions={
        <KpiStatusBadge tone={totals.meetsTarget ? "success" : "danger"} dot>
          {totals.meetsTarget ? "Meeting Target" : "Below Target"}
        </KpiStatusBadge>
      }
      footer={`${KPI_META.id} · Shift Briefings · Reporting period ${KPI_META.periodLabel} · ${events.length} events loaded from the source workbook. Edit the workbook to update this dashboard.`}
    >
      <SummaryCards totals={totals} />

      <section aria-label="Trends" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <WeeklyTrendChart data={weekly} />
        <ShiftBreakdownChart shiftData={byShift} statusData={byStatus} />
      </section>

      <section aria-label="Breakdowns" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EventLog events={events} />
        </div>
        <div className="flex flex-col gap-6">
          <TeamLeadBreakdown data={byLead} />
          <KpiDefinition />
        </div>
      </section>
    </KpiPageShell>
  )
}
