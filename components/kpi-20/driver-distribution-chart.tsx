"use client"

import { Bar, BarChart, Cell, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { DistributionPoint } from "@/lib/kpi-20/kpi"

const config = {
  shifts: { label: "Shifts", color: "var(--chart-1)" },
} satisfies ChartConfig

export function DriverDistributionChart({ data }: { data: DistributionPoint[] }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">D drivers per shift</CardTitle>
        <CardDescription>
          Distribution of D drivers on shift. Red bars fall below the minimum of two.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[260px] w-full">
          <BarChart data={data} margin={{ left: -16, right: 8, top: 16 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="count"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              label={{ value: "D drivers on shift", position: "insideBottom", offset: -2, fontSize: 11 }}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="shifts" radius={[4, 4, 0, 0]} maxBarSize={64} isAnimationActive={false}>
              <LabelList dataKey="shifts" position="top" fontSize={12} className="fill-foreground" />
              {data.map((d) => (
                <Cell
                  key={d.count}
                  fill={d.belowMinimum ? "var(--chart-2)" : "var(--chart-1)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
