"use client"

import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { KPI_META, type MonthlySummary } from "@/lib/kpi-16/kpi-data"

const chartConfig = {
  avgEmergencyMinutes: { label: "Avg Emergency", color: "var(--chart-1)" },
  avgNonEmergencyMinutes: { label: "Avg Non-Emergency", color: "var(--chart-3)" },
} satisfies ChartConfig

export function ResponseTrendChart({ monthlySummary }: { monthlySummary: MonthlySummary[] }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Average Response Time</CardTitle>
        <CardDescription>
          Monthly mean minutes vs. the {KPI_META.emergencyTargetMinutes}-min / {KPI_META.nonEmergencyTargetMinutes}-min
          targets (dashed).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <LineChart data={monthlySummary} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={32}
              domain={[0, 18]}
              unit="m"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <ReferenceLine
              y={KPI_META.emergencyTargetMinutes}
              stroke="var(--chart-1)"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
            />
            <ReferenceLine
              y={KPI_META.nonEmergencyTargetMinutes}
              stroke="var(--chart-3)"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
            />
            <Line
              dataKey="avgEmergencyMinutes"
              type="monotone"
              stroke="var(--color-avgEmergencyMinutes)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              dataKey="avgNonEmergencyMinutes"
              type="monotone"
              stroke="var(--color-avgNonEmergencyMinutes)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
