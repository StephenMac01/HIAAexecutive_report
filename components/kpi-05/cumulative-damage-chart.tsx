"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { MonthlyPoint } from "@/lib/kpi-05/kpi-types"

const chartConfig = {
  cumulativeDamage: { label: "Cumulative damage", color: "var(--chart-5)" },
} satisfies ChartConfig

export function CumulativeDamageChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cumulative damage points</CardTitle>
        <CardDescription>Running total accrued at 25 points per event</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="fillDamage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-cumulativeDamage)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-cumulativeDamage)" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={36} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="cumulativeDamage"
              type="monotone"
              stroke="var(--color-cumulativeDamage)"
              strokeWidth={2}
              fill="url(#fillDamage)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
