"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { WeekDerived } from "@/lib/kpi-06/kpi-data"

const chartConfig = {
  onTimeRate: { label: "On-time %", color: "var(--chart-1)" },
  accuracyRate: { label: "Accuracy %", color: "var(--chart-2)" },
}

export function ComplianceChart({ weeks }: { weeks: WeekDerived[] }) {
  const data = weeks.map((w) => ({
    label: w.label,
    period: w.period,
    onTimeRate: Number(w.onTimeRate.toFixed(1)),
    accuracyRate: Number(w.accuracyRate.toFixed(1)),
  }))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Timeliness & Accuracy</CardTitle>
        <CardDescription>Share of invoices submitted on time and accurately each period.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillOnTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-onTimeRate)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-onTimeRate)" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="fillAccuracy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accuracyRate)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-accuracyRate)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              domain={[90, 100]}
              ticks={[90, 92, 94, 96, 98, 100]}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v) => `${v}%`}
            />
            <ChartTooltip content={<ChartTooltipContent labelKey="period" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="accuracyRate"
              type="monotone"
              stroke="var(--color-accuracyRate)"
              fill="url(#fillAccuracy)"
              strokeWidth={2}
            />
            <Area
              dataKey="onTimeRate"
              type="monotone"
              stroke="var(--color-onTimeRate)"
              fill="url(#fillOnTime)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
