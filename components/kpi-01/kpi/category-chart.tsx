"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { Kpi01CategoryDatum } from "@/lib/kpi-01/kpi-data"

const chartConfig = {
  counted: { label: "Counted", color: "var(--chart-2)" },
  excluded: { label: "Excluded / Not Substantiated", color: "var(--chart-5)" },
} satisfies ChartConfig

export function CategoryChart({ data }: { data: Kpi01CategoryDatum[] }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Events by Incident Category</CardTitle>
        <CardDescription>
          Which conduct categories drove the KPI result this period
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart accessibilityLayer data={data} margin={{ top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="short"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={24}
            />
            <ChartTooltip
              content={<ChartTooltipContent labelKey="category" />}
              cursor={false}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar isAnimationActive={false} dataKey="counted" stackId="a" fill="var(--color-counted)" radius={[0, 0, 4, 4]} />
            <Bar isAnimationActive={false} dataKey="excluded" stackId="a" fill="var(--color-excluded)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
