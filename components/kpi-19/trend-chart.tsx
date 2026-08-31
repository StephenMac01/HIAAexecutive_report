"use client"

import {
  Bar,
  ComposedChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ResponsiveChart } from "@/components/ui/chart"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

type Point = { month: string; events: number; damagePoints: number; target: number }

export function TrendChart({ data }: { data: Point[] }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Events Over Time</CardTitle>
        <CardDescription>Monthly verified distraction events against the target of zero.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveChart>
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
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
                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--popover-foreground)",
                  fontSize: 12,
                }}
              />
              <Bar isAnimationActive={false} dataKey="events" name="Events" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={44} />
              <Line isAnimationActive={false}
                dataKey="target"
                name="Target"
                stroke="var(--chart-4)"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveChart>
        </div>
      </CardContent>
    </Card>
  )
}
