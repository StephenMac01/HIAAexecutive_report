"use client"

import { Suspense, useMemo, useRef, useState, type ReactNode } from "react"
import { FileDown, Loader2, Printer, CheckSquare, Square } from "lucide-react"
import { exportElementToPdf } from "@/lib/pdf/export-report"

export type ReportSection = {
  id: string
  label: string
  title: string
  node: ReactNode
}

export function ReportsView({ sections }: { sections: ReportSection[] }) {
  const allIds = useMemo(() => sections.map((s) => s.id), [sections])
  const [selected, setSelected] = useState<Set<string>>(() => new Set(allIds))
  const [exporting, setExporting] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const selectedCount = selected.size
  const allSelected = selectedCount === allIds.length
  const noneSelected = selectedCount === 0

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(allSelected ? new Set<string>() : new Set(allIds))
  }

  function handlePrint() {
    if (noneSelected) return
    window.print()
  }

  async function handleDownloadPdf() {
    if (noneSelected || !reportRef.current) return
    setExporting(true)
    try {
      const today = new Date().toISOString().slice(0, 10)
      await exportElementToPdf(reportRef.current, {
        fileName: `CNS-HIAA-KPI-Report-${today}.pdf`,
      })
    } catch (error) {
      console.log("[v0] PDF export failed, falling back to print:", error)
      window.print()
    } finally {
      setExporting(false)
    }
  }

  const visibleSections = sections.filter((s) => selected.has(s.id))
  const generatedOn = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Toolbar (screen only) */}
      <div className="no-print">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-balance text-2xl font-bold tracking-tight text-navy sm:text-3xl">KPI Reports</h1>
          <p className="text-pretty text-sm text-muted-foreground">
            Select the KPIs to include, then click <span className="font-medium text-foreground">Download PDF</span> to
            save a report file, or <span className="font-medium text-foreground">Print</span> to send it to a printer.
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-navy/15 bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={toggleAll}
              className="inline-flex items-center gap-2 rounded-lg border border-navy/15 bg-card px-3 py-2 text-sm font-medium text-navy transition-colors hover:bg-muted"
            >
              {allSelected ? <CheckSquare className="size-4" /> : <Square className="size-4" />}
              {allSelected ? "Deselect all" : "Select all"}
            </button>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {selectedCount} of {allIds.length} selected
              </span>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={noneSelected || exporting}
                aria-busy={exporting}
                className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-navy-foreground shadow-sm transition-colors hover:bg-navy/90 disabled:pointer-events-none disabled:opacity-50"
              >
                {exporting ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
                {exporting ? "Preparing PDF…" : "Download PDF"}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                disabled={noneSelected || exporting}
                className="inline-flex items-center gap-2 rounded-lg border border-navy/15 bg-card px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                <Printer className="size-4" />
                Print
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {sections.map((s) => {
              const isOn = selected.has(s.id)
              return (
                <label
                  key={s.id}
                  className={
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors " +
                    (isOn
                      ? "border-navy/30 bg-navy/5 text-navy"
                      : "border-border bg-card text-muted-foreground hover:bg-muted")
                  }
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isOn}
                    onChange={() => toggle(s.id)}
                  />
                  {isOn ? <CheckSquare className="size-4 shrink-0" /> : <Square className="size-4 shrink-0" />}
                  <span className="font-medium">{s.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      </div>

      <div ref={reportRef} className="bg-background">
      {/* Print/PDF cover sheet */}
      <div
        data-pdf-section
        className="mb-6 hidden border-b-2 border-navy pb-4 print:block [.pdf-capture_&]:block"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-aviation-blue">CNS HIAA</p>
        <h2 className="text-2xl font-bold text-navy">Airport KPI Report</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Generated {generatedOn} · {selectedCount} KPI{selectedCount === 1 ? "" : "s"} included
        </p>
      </div>

      {/* Report body */}
      {noneSelected ? (
        <div className="no-print rounded-xl border border-dashed border-border bg-muted/40 p-12 text-center text-sm text-muted-foreground">
          Select at least one KPI above to build your report.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {visibleSections.map((s, i) => (
            <section
              key={s.id}
              data-pdf-section
              className={"report-section rounded-xl border border-navy/10 bg-card " + (i > 0 ? "report-page-break" : "")}
            >
              <div className="flex items-center justify-between gap-2 border-b border-navy/10 px-5 py-3">
                <h3 className="text-sm font-bold tracking-tight text-navy">{s.title}</h3>
                <span className="text-xs font-semibold text-muted-foreground">{s.label}</span>
              </div>
              <div className="p-2 sm:p-4">
                {/* Each dashboard streams in its own boundary so the server
                    renders them incrementally instead of materializing all 21
                    at once (which exhausts memory on constrained hosts). */}
                <Suspense
                  fallback={
                    <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                      Loading {s.label}…
                    </div>
                  }
                >
                  {s.node}
                </Suspense>
              </div>
            </section>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
