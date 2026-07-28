"use client"

import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { kpiMeta, type Kpi01TimelineDatum } from "@/lib/kpi-01/kpi-data"

const chartConfig = {
  counted: { label: "Counted Events", color: "var(--chart-2)" },
  points: { label: "Damage Points", color: "var(--chart-1)" },
} satisfies ChartConfig

export function TrendChart({ data }: { data: Kpi01TimelineDatum[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cumulative Impact Over the Period</CardTitle>
        <CardDescription>
          Counted events crossed the fail threshold ({kpiMeta.failThreshold}) early and
          kept accruing Damage Points
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart accessibilityLayer data={data} margin={{ top: 8, right: 8 }}>
            <defs>
              <linearGradient id="fillCounted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-counted)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-counted)" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="fillPoints" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-points)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-points)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={24} />
            <ReferenceLine
              y={kpiMeta.failThreshold}
              stroke="var(--destructive)"
              strokeDasharray="4 4"
              label={{
                value: `Fail ≥ ${kpiMeta.failThreshold}`,
                position: "insideTopLeft",
                fill: "var(--destructive)",
                fontSize: 11,
              }}
            />
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="points"
              type="monotone"
              fill="url(#fillPoints)"
              stroke="var(--color-points)"
              strokeWidth={2}
            />
            <Area
              dataKey="counted"
              type="monotone"
              fill="url(#fillCounted)"
              stroke="var(--color-counted)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
