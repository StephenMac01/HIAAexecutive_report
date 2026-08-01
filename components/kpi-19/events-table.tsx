"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/kpi-19/badge"
import { kpi, type DistractionEvent } from "@/lib/kpi-19/kpi-data"

export function EventsTable({ events }: { events: DistractionEvent[] }) {
  const [query, setQuery] = useState("")
  const [severity, setSeverity] = useState<"All" | "Minor" | "Major">("All")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events.filter((e) => {
      const matchesSeverity = severity === "All" || e.severity === severity
      const matchesQuery =
        q === "" ||
        [e.id, e.officer, e.post, e.distractionType, e.supervisor, e.shift]
          .join(" ")
          .toLowerCase()
          .includes(q)
      return matchesSeverity && matchesQuery
    })
  }, [query, severity])

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle>Event Log</CardTitle>
          <CardDescription>
            {filtered.length} of {events.length} reported events
          </CardDescription>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search officer, post, type..."
              className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Search events"
            />
          </div>
          <div className="flex gap-1 rounded-md border p-1">
            {(["All", "Minor", "Major"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                  severity === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 font-medium">Event</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Post</th>
                <th className="px-3 py-2 font-medium">Officer</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Severity</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 text-right font-medium">Points</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{e.id}</td>
                  <td className="px-3 py-3 whitespace-nowrap tabular-nums">{e.date}</td>
                  <td className="px-3 py-3">{e.post}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{e.officer}</td>
                  <td className="px-3 py-3">{e.distractionType}</td>
                  <td className="px-3 py-3">
                    <Badge variant={e.severity === "Major" ? "destructive" : "muted"}>{e.severity}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={e.verified ? "accent" : "outline"}>{e.verified ? "Verified" : "Pending"}</Badge>
                  </td>
                  <td className="px-3 py-3 text-right font-semibold tabular-nums">
                    {e.verified ? kpi.damagePointsPerEvent : 0}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-muted-foreground">
                    No events match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
