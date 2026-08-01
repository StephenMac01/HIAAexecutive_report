"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { SourceDatum } from "@/lib/kpi-02/kpi-data"

const chartConfig = {
  count: {
    label: "Compliments",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function SourceBreakdown({ data }: { data: SourceDatum[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>By source channel</CardTitle>
        <CardDescription>
          Where counted compliments were received, per the calculation rule.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 8, right: 16 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="source"
              tickLine={false}
              axisLine={false}
              width={140}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
