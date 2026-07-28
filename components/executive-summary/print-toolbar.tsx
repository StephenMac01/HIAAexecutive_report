"use client"

import { FileDown, Printer } from "lucide-react"

export function PrintToolbar({
  reportingMonth,
  kpisReported,
  kpisTotal,
  statusHeadline,
}: {
  reportingMonth: string
  kpisReported: number
  kpisTotal: number
  statusHeadline: string
}) {
  const generatedOn = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  function handlePrint() {
    window.print()
  }

  return (
    <>
      {/* Screen-only toolbar */}
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-balance text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Executive Summary — Schedule &quot;D&quot;
          </h1>
          <p className="text-pretty text-sm text-muted-foreground">
            Portfolio roll-up of KPI-01 through KPI-21 · Reporting month{" "}
            <span className="font-medium text-foreground">{reportingMonth}</span>. Use{" "}
            <span className="font-medium text-foreground">Download PDF</span> and choose &ldquo;Save as PDF&rdquo; for
            contract reporting.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-navy-foreground shadow-sm transition-colors hover:bg-navy/90"
          >
            <FileDown className="size-4" />
            Download PDF
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg border border-navy/15 bg-card px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-muted"
          >
            <Printer className="size-4" />
            Print
          </button>
        </div>
      </div>

      {/* Print-only cover header */}
      <div className="hidden print:block">
        <div className="mb-6 border-b-2 border-navy pb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-aviation-blue">CNS HIAA</p>
          <h2 className="text-2xl font-bold text-navy">Executive Summary — Schedule &quot;D&quot;</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Generated {generatedOn} · Reporting month {reportingMonth} · {kpisReported} of {kpisTotal} KPIs reporting ·{" "}
            {statusHeadline}
          </p>
        </div>
      </div>
    </>
  )
}
