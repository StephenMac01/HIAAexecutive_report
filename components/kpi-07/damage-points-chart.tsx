"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { MonthlyDatum } from "@/lib/kpi-07/kpi-data"

const chartConfig = {
  cumulative: { label: "Cumulative Damage Points", color: "var(--chart-2)" },
}

export function DamagePointsChart({ monthlyIncidents }: { monthlyIncidents: MonthlyDatum[] }) {
  const cumulative = monthlyIncidents.reduce<{ month: string; cumulative: number }[]>((acc, m) => {
    const prev = acc.length ? acc[acc.length - 1].cumulative : 0
    acc.push({ month: m.month, cumulative: prev + m.damagePoints })
    return acc
  }, [])

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Cumulative Damage Points</CardTitle>
        <CardDescription>Running total accrued at 50 points per confirmed event.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart accessibilityLayer data={cumulative} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="fillDamage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={36} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="cumulative"
              type="stepAfter"
              stroke="var(--chart-2)"
              strokeWidth={2}
              fill="url(#fillDamage)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
