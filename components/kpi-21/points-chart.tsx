"use client"

import {
  Bar,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ResponsiveChart } from "@/components/ui/chart"
import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { StaffingRecord } from "@/lib/kpi-21/kpi"

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const r = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-semibold text-popover-foreground">{r.label}</p>
      <p className="text-muted-foreground">
        Month points:{" "}
        <span className={r.netPoints >= 0 ? "text-success" : "text-destructive"}>
          {r.netPoints > 0 ? "+" : ""}
          {r.netPoints}
        </span>
      </p>
      <p className="text-muted-foreground">
        Cumulative:{" "}
        <span className={r.cumulative >= 0 ? "text-success" : "text-destructive"}>
          {r.cumulative > 0 ? "+" : ""}
          {r.cumulative}
        </span>
      </p>
    </div>
  )
}

export function PointsChart({ records }: { records: StaffingRecord[] }) {
  const data = useMemo(() => {
    let running = 0
    return records.map((r) => {
      running += r.netPoints
      return { ...r, cumulative: running }
    })
  }, [records])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Damage / Advantage Points</CardTitle>
        <CardDescription>
          Per-month net points (green advantage, red damage) with the running cumulative balance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveChart>
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <ReferenceLine y={0} stroke="var(--color-border)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)" }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-muted)", fillOpacity: 0.4 }} />
              <Bar isAnimationActive={false} dataKey="netPoints" radius={[3, 3, 0, 0]} maxBarSize={40}>
                {data.map((r) => (
                  <Cell
                    key={r.month}
                    fill={r.netPoints >= 0 ? "var(--color-success)" : "var(--color-destructive)"}
                  />
                ))}
              </Bar>
              <Line isAnimationActive={false}
                type="monotone"
                dataKey="cumulative"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: "var(--color-primary)" }}
              />
            </ComposedChart>
          </ResponsiveChart>
        </div>
      </CardContent>
    </Card>
  )
}
