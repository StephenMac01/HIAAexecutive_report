"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { MonthlyPoint } from "@/lib/kpi-14/kpi"

export function TrendChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-card-foreground">Change Events by Month</h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Approved (with consent) vs. unauthorized changes across the reporting period.
      </p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "var(--popover-foreground)",
              }}
              labelStyle={{ color: "var(--popover-foreground)", fontWeight: 600 }}
            />
            <Bar dataKey="approved" name="Approved" radius={[4, 4, 0, 0]} fill="var(--chart-1)" />
            <Bar dataKey="unauthorized" name="Unauthorized" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill="var(--chart-3)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-6">
        <Legend color="var(--chart-1)" label="Approved" />
        <Legend color="var(--chart-3)" label="Unauthorized" />
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-3 rounded-sm" style={{ background: color }} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
