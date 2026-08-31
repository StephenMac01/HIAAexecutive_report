import type { ReactNode } from "react"
import { KpiNavGrid } from "@/components/portal/kpi-nav-grid"
import { SourceDataButton } from "@/components/portal/source-data-button"

export function PortalShell({
  title,
  kpiId,
  children,
}: {
  /** Heading shown above the content card, e.g. "KPI-01 Dashboard" */
  title: string
  /** KPI id used to render the single, standardized source-data download button. */
  kpiId?: string
  children: ReactNode
}) {
  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Branding banner */}
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
          CNS <span className="text-aviation-blue">HIAA</span>
        </h1>
        <p className="text-sm font-medium text-muted-foreground">Airport KPI Dashboard</p>
        <span className="mt-1 h-0.5 w-24 rounded-full bg-aviation" aria-hidden="true" />
      </div>

      {/* KPI selector */}
      <KpiNavGrid />

      {/* Content card */}
      <section className="rounded-2xl border border-navy/10 bg-card p-5 shadow-sm sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-navy">{title}</h2>
            <span className="h-0.5 w-16 rounded-full bg-aviation" aria-hidden="true" />
          </div>
          {kpiId ? <SourceDataButton kpiId={kpiId} /> : null}
        </div>
        {children}
      </section>
    </main>
  )
}
