"use client"

import { useState } from "react"
import type { ApprovalStatus, ChangeEvent } from "@/lib/kpi-14/kpi"

type Filter = "All" | ApprovalStatus

const FILTERS: Filter[] = ["All", "Unauthorized", "Approved", "Pending"]

export function EventsTable({ events }: { events: ChangeEvent[] }) {
  const [filter, setFilter] = useState<Filter>("All")
  const rows = filter === "All" ? events : events.filter((e) => e.status === filter)

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">Change Event Log</h3>
          <p className="text-xs text-muted-foreground">
            Sourced from <span className="font-mono">kpi-14-events.xlsx</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Week Ending</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Document / Training</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Damage</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{e.id}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                  {e.weekEnding}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-card-foreground">{e.date}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-card-foreground">{e.item}</div>
                  <div className="text-xs text-muted-foreground">{e.description}</div>
                </td>
                <td className="px-4 py-3 text-card-foreground">{e.type}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={e.status} />
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold">
                  <span className={e.damagePoints > 0 ? "text-destructive" : "text-muted-foreground"}>
                    {e.damagePoints}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No events match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const styles: Record<ApprovalStatus, string> = {
    Approved: "bg-success/15 text-success",
    Unauthorized: "bg-destructive/15 text-destructive",
    Pending: "bg-warning/20 text-warning-foreground",
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  )
}
