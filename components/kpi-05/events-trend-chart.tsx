"use client"

import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { MonthlyPoint } from "@/lib/kpi-05/kpi-types"

const chartConfig = {
  untrained: { label: "Untrained working", color: "var(--chart-1)" },
  unqualified: { label: "Unqualified filling post", color: "var(--chart-4)" },
} satisfies ChartConfig

export function EventsTrendChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Events over time</CardTitle>
        <CardDescription>Monthly events by type. The target is zero &mdash; any bar is a breach.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} width={28} />
            <ReferenceLine
              y={0}
              stroke="var(--chart-3)"
              strokeWidth={2}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="untrained" stackId="a" fill="var(--color-untrained)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="unqualified" stackId="a" fill="var(--color-unqualified)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
