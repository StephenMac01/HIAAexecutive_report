"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ResponsiveChart } from "@/components/ui/chart"
import { kpiSpec, type MonthlyRecord } from "@/lib/kpi-11/kpi-data"

export function EventsChart({ monthlyData }: { monthlyData: MonthlyRecord[] }) {
  const chartData = monthlyData.map((r) => ({
    period: r.period.replace(" 20", " '"),
    events: r.events,
    fail: r.status === "Fail",
  }))

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-card-foreground">Non-Compliance Events by Month</h2>
        <p className="text-sm text-muted-foreground">
          Target is {kpiSpec.threshold.target} events. Any month reaching {kpiSpec.threshold.fail} is a fail.
        </p>
      </div>
      <div className="h-72 w-full">
        <ResponsiveChart>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, 2]}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                color: "var(--popover-foreground)",
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--popover-foreground)", fontWeight: 600 }}
              formatter={(value) => {
                const n = Number(value)
                return [`${n} event${n === 1 ? "" : "s"}`, "Events"]
              }}
            />
            <ReferenceLine
              y={kpiSpec.threshold.fail}
              stroke="var(--destructive)"
              strokeDasharray="4 4"
              label={{ value: "Fail threshold", fill: "var(--destructive)", fontSize: 11, position: "insideTopRight" }}
            />
            <Bar isAnimationActive={false} dataKey="events" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.fail ? "var(--destructive)" : "var(--chart-2)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveChart>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-chart-2" /> Compliant (0 events)
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-destructive" /> Fail (1+ events)
        </span>
      </div>
    </div>
  )
}
