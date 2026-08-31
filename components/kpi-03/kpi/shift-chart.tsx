"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { ShiftBreakdown } from "@/lib/kpi-03/kpi-data"

const chartConfig = {
  occurrences: { label: "Occurrences", color: "var(--chart-2)" },
} satisfies ChartConfig

export function ShiftChart({ byShift }: { byShift: ShiftBreakdown[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Occurrences by Shift</CardTitle>
        <CardDescription>Where below-minimum staffing is concentrated.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
          <BarChart
            data={byShift}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="shift"
              tickLine={false}
              axisLine={false}
              width={110}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="occurrences"
              fill="var(--color-occurrences)"
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
