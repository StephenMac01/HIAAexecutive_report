"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { MonthlyEvent, CategoryDatum, StatusDatum } from "@/lib/kpi-12/kpi-data"

export function KpiCharts({
  monthlyEvents,
  eventsByCategory,
  statusBreakdown,
}: {
  monthlyEvents: MonthlyEvent[]
  eventsByCategory: CategoryDatum[]
  statusBreakdown: StatusDatum[]
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="border-border lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Events vs. Target by Month</CardTitle>
          <CardDescription>Each event represents one Official Languages Act incident. Target is 0.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              events: { label: "Events", color: "var(--chart-3)" },
              target: { label: "Target", color: "var(--chart-2)" },
            }}
            className="h-[280px] w-full"
          >
            <AreaChart data={monthlyEvents} margin={{ left: 4, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="fillEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-events)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-events)" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="events"
                stroke="var(--color-events)"
                fill="url(#fillEvents)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="var(--color-target)"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Resolution Status</CardTitle>
          <CardDescription>Current handling state of logged events.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: { label: "Events" },
              Resolved: { label: "Resolved", color: "var(--chart-1)" },
              "In Review": { label: "In Review", color: "var(--chart-4)" },
              Open: { label: "Open", color: "var(--chart-3)" },
            }}
            className="mx-auto h-[280px] w-full"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
              <Pie data={statusBreakdown} dataKey="count" nameKey="status" innerRadius={55} strokeWidth={2}>
                {statusBreakdown.map((entry) => (
                  <Cell key={entry.status} fill={`var(--color-${entry.status.replace(/\s/g, "-")})`} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="status" />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border-border lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-base">Events by Category</CardTitle>
          <CardDescription>Where non-compliance events are concentrated.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ events: { label: "Events", color: "var(--chart-1)" } }}
            className="h-[260px] w-full"
          >
            <BarChart data={eventsByCategory} layout="vertical" margin={{ left: 12, right: 16 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="category"
                tickLine={false}
                axisLine={false}
                width={150}
                tickMargin={6}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="events" fill="var(--color-events)" radius={[0, 4, 4, 0]} barSize={22} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
