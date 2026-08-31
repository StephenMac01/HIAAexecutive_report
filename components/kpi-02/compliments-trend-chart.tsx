"use client"

import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { KPI02, type MonthlyPoint } from "@/lib/kpi-02/kpi-data"

const chartConfig = {
  counted: {
    label: "Compliments",
    color: "var(--chart-1)",
  },
  advantagePoints: {
    label: "Advantage pts",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ComplimentsTrendChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Compliments over time</CardTitle>
        <CardDescription>
          Monthly counted compliment events for 2025, with the target line and earned advantage points.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          <AreaChart data={data} margin={{ left: -12, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="fillCounted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-counted)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-counted)" stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="fillPoints" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-advantagePoints)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-advantagePoints)" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={32} allowDecimals={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <ReferenceLine
              y={KPI02.target}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              strokeOpacity={0.7}
              label={{
                value: `Target ${KPI02.target}`,
                position: "insideTopLeft",
                fill: "var(--muted-foreground)",
                fontSize: 11,
              }}
            />
            <Area
              dataKey="advantagePoints"
              type="monotone"
              fill="url(#fillPoints)"
              stroke="var(--color-advantagePoints)"
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
