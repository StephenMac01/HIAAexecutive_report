"use client"

import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { MonthPoint } from "@/lib/kpi-17/kpi"

const config = {
  events: { label: "Events", color: "var(--chart-1)" },
}

export function TrendChart({ monthly }: { monthly: MonthPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Monthly Non-Adherence Events</CardTitle>
        <CardDescription>Events per reporting period vs. target of 0</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[260px] w-full">
          <BarChart data={monthly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
            <ReferenceLine y={0} stroke="var(--chart-5)" strokeWidth={2} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="events" fill="var(--color-events)" radius={[4, 4, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
