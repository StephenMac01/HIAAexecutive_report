"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Point = { month: string; events: number; target: number }

export function TrendChart({ data }: { data: Point[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly failure events</CardTitle>
        <CardDescription>Events per month against the target of zero</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="eventsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                cursor={{ stroke: "var(--border)" }}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  color: "var(--popover-foreground)",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="events"
                name="Events"
                stroke="var(--chart-3)"
                strokeWidth={2}
                fill="url(#eventsFill)"
                dot={{ r: 3, fill: "var(--chart-3)" }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Target"
                stroke="var(--chart-2)"
                strokeWidth={1.5}
                strokeDasharray="5 4"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
