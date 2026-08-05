"use client"

import { useState } from "react"
import { FileDown, Loader2, Printer } from "lucide-react"
import { exportElementToPdf } from "@/lib/pdf/export-report"

export function PrintToolbar({
  reportingMonth,
  kpisReported,
  kpisTotal,
  statusHeadline,
  generatedAt,
}: {
  reportingMonth: string
  kpisReported: number
  kpisTotal: number
  statusHeadline: string
  /** ISO timestamp of the server-side data refresh (from getExecutiveSummary). */
  generatedAt: string
}) {
  // Format the server-provided timestamp in a FIXED timezone so the server (UTC)
  // and the client (viewer's local zone) render identical text — otherwise the
  // hours differ and React throws a hydration mismatch. Atlantic Time is the
  // airport's operating zone, so it's also the correct zone for the report.
  const REPORT_TZ = "America/Halifax"
  const refreshed = new Date(generatedAt)
  const generatedOn = refreshed.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: REPORT_TZ,
  })
  const refreshedAt = refreshed.toLocaleString("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: REPORT_TZ,
  })

  const [exporting, setExporting] = useState(false)

  function handlePrint() {
    window.print()
  }

  async function handleDownloadPdf() {
    const target = document.getElementById("exec-report-root")
    if (!target) {
      window.print()
      return
    }
    setExporting(true)
    try {
      await exportElementToPdf(target, {
        fileName: `CNS-HIAA-Executive-Summary-${reportingMonth.replace(/\s+/g, "-")}.pdf`,
      })
    } catch (error) {
      console.log("[v0] PDF export failed, falling back to print:", error)
      // Fall back to the browser print dialog so the user is never stuck.
      window.print()
    } finally {
      setExporting(false)
    }
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
            <span className="font-medium text-foreground">{reportingMonth}</span>.{" "}
            <span className="font-medium text-foreground">Download PDF</span> saves a contract-ready report file.
          </p>
          <p className="text-xs text-muted-foreground">
            Data refreshed <span className="font-medium text-foreground">{refreshedAt} AT</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={exporting}
            aria-busy={exporting}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-navy-foreground shadow-sm transition-colors hover:bg-navy/90 disabled:pointer-events-none disabled:opacity-60"
          >
            {exporting ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
            {exporting ? "Preparing PDF…" : "Download PDF"}
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
