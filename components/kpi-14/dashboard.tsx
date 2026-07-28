"use client"

import { useEffect, useMemo, useState } from "react"
import * as XLSX from "xlsx"
import { FileSpreadsheet, RefreshCw } from "lucide-react"
import {
  byMonth,
  rowToEvent,
  summarize,
  type ChangeEvent,
  KPI,
} from "@/lib/kpi-14/kpi"
import { KpiPageShell } from "@/components/portal/kpi-chrome"
import { KpiScorecard } from "@/components/kpi-14/kpi-scorecard"
import { StatusBanner } from "@/components/kpi-14/status-banner"
import { StatCards } from "@/components/kpi-14/stat-cards"
import { TrendChart } from "@/components/kpi-14/trend-chart"
import { EventsTable } from "@/components/kpi-14/events-table"

// Live source: streamed from SharePoint (or local fallback) via the server
// endpoint, so the client always reads the current workbook bytes.
const DATA_URL = "/api/kpi/kpi-14/xlsx"

export function Kpi14Dashboard() {
  const [events, setEvents] = useState<ChangeEvent[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setError(null)
    setEvents(null)
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" })
      if (!res.ok) throw new Error(`Failed to load workbook (${res.status})`)
      const buffer = await res.arrayBuffer()
      const wb = XLSX.read(buffer, { type: "array" })
      const sheet = wb.Sheets["Events"] ?? wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 })
      const parsed = rows
        .slice(1)
        .filter((r) => Array.isArray(r) && r[0])
        .map(rowToEvent)
      setEvents(parsed)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    }
  }

  useEffect(() => {
    load()
  }, [])

  const summary = useMemo(() => (events ? summarize(events) : null), [events])
  const monthly = useMemo(() => (events ? byMonth(events) : []), [events])

  return (
    <KpiPageShell
      icon={<FileSpreadsheet className="size-5" />}
      label="HIAA Contractor Performance"
      title={`${KPI.id} · ${KPI.name}`}
      description="Live dashboard tracking unauthorized changes to HIAA-provided documents and training. Data is read directly from the source Excel workbook."
      actions={
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-card-foreground shadow-sm transition-colors hover:bg-muted"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      }
    >
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Could not load the data workbook: {error}
        </div>
      )}

      {!events && !error && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          <RefreshCw className="size-4 animate-spin" />
          Loading data from Excel…
        </div>
      )}

      {events && summary && (
        <>
          <StatusBanner summary={summary} />
          <StatCards summary={summary} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <TrendChart data={monthly} />
            </div>
            <div className="lg:col-span-2">
              <KpiScorecard />
            </div>
          </div>
          <EventsTable events={events} />
        </>
      )}
    </KpiPageShell>
  )
}
