"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { ShiftTypePoint } from "@/lib/kpi-20/kpi"

const config = {
  events: { label: "Events", color: "var(--chart-2)" },
} satisfies ChartConfig

export function EventsByShiftChart({ data }: { data: ShiftTypePoint[] }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">Events by shift type</CardTitle>
        <CardDescription>Where shortfalls happen — day versus night shifts.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[260px] w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 8, right: 24, top: 8, bottom: 8 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
            <YAxis
              type="category"
              dataKey="shift"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              width={56}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="events"
              fill="var(--color-events)"
              radius={[0, 4, 4, 0]}
              maxBarSize={48}
              isAnimationActive={false}
            >
              <LabelList dataKey="events" position="right" fontSize={12} className="fill-foreground" />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
