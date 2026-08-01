"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import type { getWeeklyTrend } from "@/lib/kpi-13/kpi-data"

type WeeklyDatum = ReturnType<typeof getWeeklyTrend>[number]

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      <p className="text-muted-foreground">
        Events: <span className="font-semibold text-foreground">{payload[0].value}</span>
      </p>
      <p className="text-muted-foreground">
        Damage points:{" "}
        <span className="font-semibold text-destructive">{payload[0].value * 2}</span>
      </p>
    </div>
  )
}

export function WeeklyTrendChart({ data }: { data: WeeklyDatum[] }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Weekly Event Trend</CardTitle>
        <CardDescription>Failure events per week against the target line of 0</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 200 }}>
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="week"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<TrendTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
              <Bar dataKey="events" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={48} />
              <Line
                dataKey="target"
                stroke="var(--chart-3)"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
