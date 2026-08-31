"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { WeeklyPoint } from "@/lib/kpi-20/kpi"

const config = {
  events: { label: "Events", color: "var(--chart-2)" },
} satisfies ChartConfig

export function WeeklyTrendChart({ data }: { data: WeeklyPoint[] }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">Events by week</CardTitle>
        <CardDescription>
          Shifts with fewer than 2 D drivers. The target is zero events every week.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[260px] w-full">
          <BarChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="events"
              fill="var(--color-events)"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
