"use client"

import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { MonthlyPoint } from "@/lib/kpi-04/kpi-data"

const chartConfig = {
  lateReport: {
    label: "Late report (>5 min)",
    color: "var(--chart-3)",
  },
  noNotice: {
    label: "No 24h notice",
    color: "var(--chart-4)",
  },
}

export function TrendChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Monthly Events vs. Target</CardTitle>
        <CardDescription>
          Unreported absent posts by month. The target line sits at zero — any bar
          above it is a breach period.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={40}
              fontSize={12}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <ReferenceLine
              y={0}
              stroke="var(--chart-5)"
              strokeWidth={2}
              label={{
                value: "Target 0",
                position: "insideTopLeft",
                fill: "var(--muted-foreground)",
                fontSize: 11,
              }}
            />
            <Bar
              dataKey="lateReport"
              stackId="events"
              fill="var(--color-lateReport)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="noNotice"
              stackId="events"
              fill="var(--color-noNotice)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
