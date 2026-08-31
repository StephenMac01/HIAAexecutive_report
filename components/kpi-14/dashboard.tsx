import { FileSpreadsheet } from "lucide-react"
import { KPI } from "@/lib/kpi-14/kpi"
import { getKpi14Data } from "@/lib/kpi-14/get-data"
import { KpiPageShell } from "@/components/portal/kpi-chrome"
import { KpiScorecard } from "@/components/kpi-14/kpi-scorecard"
import { StatusBanner } from "@/components/kpi-14/status-banner"
import { StatCards } from "@/components/kpi-14/stat-cards"
import { TrendChart } from "@/components/kpi-14/trend-chart"
import { EventsTable } from "@/components/kpi-14/events-table"
import { RefreshButton } from "@/components/kpi-14/refresh-button"

/**
 * KPI-14 dashboard — rendered on the server like every other KPI. The workbook
 * is read and parsed server-side via `getKpi14Data()` (SharePoint or local
 * fallback), so the page arrives fully populated with no client-side Excel
 * fetch or parsing. This is what keeps the charts from getting stuck behind a
 * perpetual "Loading data from Excel…" spinner in embedded/slow clients.
 */
export async function Kpi14Dashboard() {
  let data: Awaited<ReturnType<typeof getKpi14Data>> | null = null
  let error: string | null = null
  try {
    data = await getKpi14Data()
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error"
  }

  return (
    <KpiPageShell
      icon={<FileSpreadsheet className="size-5" />}
      label="HIAA Contractor Performance"
      title={`${KPI.id} · ${KPI.name}`}
      description="Live dashboard tracking unauthorized changes to HIAA-provided documents and training. Data is read directly from the source Excel workbook."
      actions={<RefreshButton />}
    >
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Could not load the data workbook: {error}
        </div>
      ) : data ? (
        <>
          <StatusBanner summary={data.summary} />
          <StatCards summary={data.summary} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <TrendChart data={data.monthly} />
            </div>
            <div className="lg:col-span-2">
              <KpiScorecard />
            </div>
          </div>
          <EventsTable events={data.events} />
        </>
      ) : null}
    </KpiPageShell>
  )
}
