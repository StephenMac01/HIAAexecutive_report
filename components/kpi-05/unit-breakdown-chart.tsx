"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { UnitSlice } from "@/lib/kpi-05/kpi-types"

const chartConfig = {
  count: { label: "Events", color: "var(--chart-2)" },
} satisfies ChartConfig

export function UnitBreakdownChart({ data }: { data: UnitSlice[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Events by unit</CardTitle>
        <CardDescription>Where breaches originate across the organisation</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              type="category"
              dataKey="unit"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={92}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
