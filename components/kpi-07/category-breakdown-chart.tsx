"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { CategoryDatum } from "@/lib/kpi-07/kpi-data"

const chartConfig = {
  count: { label: "Events", color: "var(--chart-1)" },
}

export function CategoryBreakdownChart({ categoryBreakdown }: { categoryBreakdown: CategoryDatum[] }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Infractions by Category</CardTitle>
        <CardDescription>Where confirmed and pending events originated across the period.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart
            accessibilityLayer
            data={categoryBreakdown}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              type="category"
              dataKey="category"
              tickLine={false}
              axisLine={false}
              width={150}
              tickMargin={8}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar isAnimationActive={false} dataKey="count" radius={[0, 4, 4, 0]} fill="var(--chart-1)" maxBarSize={28} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
