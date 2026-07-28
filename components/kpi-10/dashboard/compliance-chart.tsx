"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { DailyEvent } from "@/lib/kpi-10/kpi-data"

export function ComplianceChart({ dailyEvents }: { dailyEvents: DailyEvent[] }) {
  return (
    <section
      aria-label="Daily uniform events trend"
      className="rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Daily events — rolling 30 days
          </h3>
          <p className="text-xs text-muted-foreground">
            Non-compliant uniform events per day
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-chart-1" />
            Events
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-0.5 w-4 bg-destructive" />
            Fail line
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dailyEvents} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="eventsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              interval={4}
            />
            <YAxis
              domain={[0, 2]}
              ticks={[0, 1, 2]}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ stroke: "var(--border)" }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                fontSize: "12px",
                color: "var(--popover-foreground)",
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
            />
            <ReferenceLine
              y={1}
              stroke="var(--destructive)"
              strokeDasharray="4 4"
              label={{
                value: "Fail",
                position: "right",
                fill: "var(--destructive)",
                fontSize: 11,
              }}
            />
            <Area
              type="monotone"
              dataKey="events"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#eventsFill)"
              dot={false}
              activeDot={{ r: 4, fill: "var(--chart-1)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
