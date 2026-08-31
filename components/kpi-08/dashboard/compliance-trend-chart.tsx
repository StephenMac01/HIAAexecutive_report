"use client"

import { Area, AreaChart, CartesianGrid, ReferenceArea, ReferenceLine, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { TrendPoint } from "@/lib/kpi-08/kpi-data"

const chartConfig = {
  rate: { label: "Compliance", color: "var(--chart-1)" },
} satisfies ChartConfig

export function ComplianceTrendChart({ complianceTrend }: { complianceTrend: TrendPoint[] }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Compliance Rate Trend</CardTitle>
        <CardDescription>Monthly patrol completion rate against KPI-08 thresholds</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={complianceTrend} margin={{ left: 4, right: 12, top: 8 }}>
            <defs>
              <linearGradient id="fillRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-rate)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-rate)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            {/* Threshold band shading */}
            <ReferenceArea y1={0} y2={79} fill="var(--chart-5)" fillOpacity={0.06} />
            <ReferenceArea y1={79} y2={91} fill="var(--chart-3)" fillOpacity={0.07} />
            <ReferenceArea y1={91} y2={100} fill="var(--chart-4)" fillOpacity={0.07} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
            <YAxis
              domain={[40, 100]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={40}
              unit="%"
              className="text-xs"
            />
            <ReferenceLine y={79} strokeDasharray="4 4" stroke="var(--chart-5)" strokeOpacity={0.7} />
            <ReferenceLine y={91} strokeDasharray="4 4" stroke="var(--chart-4)" strokeOpacity={0.7} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" formatter={(v) => `${v}%`} />}
            />
            <Area isAnimationActive={false} dataKey="rate" type="monotone" fill="url(#fillRate)" stroke="var(--color-rate)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-sm bg-chart-4/40" aria-hidden="true" /> Success ≥ 91%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-sm bg-chart-3/40" aria-hidden="true" /> Target 80–90%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-sm bg-chart-5/40" aria-hidden="true" /> Fail ≤ 79%
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
