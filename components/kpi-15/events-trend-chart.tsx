"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { WeeklyPoint } from "@/lib/kpi-15/kpi-data"

interface TooltipEntry {
  payload: WeeklyPoint
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipEntry[] }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-popover-foreground">{p.label}</p>
      <p className="mt-1 text-muted-foreground">
        Events: <span className="font-mono font-semibold text-foreground">{p.events}</span>
      </p>
      <p className="text-muted-foreground">
        Damage points: <span className="font-mono font-semibold text-foreground">{p.damagePoints}</span>
      </p>
      <p className="mt-1 font-medium" style={{ color: p.events >= 1 ? "var(--destructive)" : "var(--chart-4)" }}>
        {p.events >= 1 ? "Fail" : "Target met"}
      </p>
    </div>
  )
}

export function EventsTrendChart({ data }: { data: WeeklyPoint[] }) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-border px-5 py-4">
        <CardTitle className="text-sm font-semibold">Events per week (week ending)</CardTitle>
        <CardDescription className="text-xs">
          Target is 0 events per week. Any bar reaching the dashed line (1) fails that week.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 200 }}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                width={40}
              />
              <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.5 }} content={<ChartTooltip />} />
              <ReferenceLine
                y={1}
                stroke="var(--destructive)"
                strokeDasharray="4 4"
                label={{ value: "Fail = 1", position: "right", fill: "var(--destructive)", fontSize: 11 }}
              />
              <Bar dataKey="events" radius={[4, 4, 0, 0]} maxBarSize={56}>
                {data.map((entry) => (
                  <Cell
                    key={entry.weekEnding}
                    fill={entry.events >= 1 ? "var(--destructive)" : "var(--chart-4)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
