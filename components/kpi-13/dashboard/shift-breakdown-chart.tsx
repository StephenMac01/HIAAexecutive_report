"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import type { getEventsByShift, getStatusBreakdown } from "@/lib/kpi-13/kpi-data"

type ShiftDatum = ReturnType<typeof getEventsByShift>[number]
type StatusDatum = ReturnType<typeof getStatusBreakdown>[number]

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-4)"]

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-popover-foreground">{p.name}</p>
      <p className="text-muted-foreground">
        Events: <span className="font-semibold text-foreground">{p.value}</span>
      </p>
    </div>
  )
}

export function ShiftBreakdownChart({
  shiftData: rawShiftData,
  statusData: rawStatusData,
}: {
  shiftData: ShiftDatum[]
  statusData: StatusDatum[]
}) {
  const shiftData = rawShiftData.filter((d) => d.events > 0)
  const statusData = rawStatusData.filter((d) => d.events > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events by Shift</CardTitle>
        <CardDescription>Where briefing failures occurred</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<ChartTooltip />} />
              <Pie
                data={shiftData}
                dataKey="events"
                nameKey="shift"
                innerRadius={48}
                outerRadius={80}
                paddingAngle={3}
                strokeWidth={0}
              >
                {shiftData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-2 flex flex-col gap-2">
          {shiftData.map((d, i) => (
            <li key={d.shift} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  aria-hidden="true"
                />
                {d.shift} shift
              </span>
              <span className="text-muted-foreground">
                {d.events} {d.events === 1 ? "event" : "events"}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            By failure type
          </p>
          <ul className="flex flex-col gap-1.5">
            {statusData.map((d) => (
              <li key={d.status} className="flex items-center justify-between text-sm">
                <span>{d.status}</span>
                <span className="font-medium">{d.events}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
