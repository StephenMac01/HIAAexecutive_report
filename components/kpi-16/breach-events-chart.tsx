"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { MonthlySummary } from "@/lib/kpi-16/kpi-data"

const chartConfig = {
  emergencyBreaches: { label: "Emergency", color: "var(--chart-1)" },
  nonEmergencyBreaches: { label: "Non-Emergency", color: "var(--chart-3)" },
} satisfies ChartConfig

export function BreachEventsChart({ monthlySummary }: { monthlySummary: MonthlySummary[] }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Breach Events by Month</CardTitle>
        <CardDescription>Count of responses that exceeded the required time frame (target = 0).</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart data={monthlySummary} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={28} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar isAnimationActive={false} dataKey="emergencyBreaches" fill="var(--color-emergencyBreaches)" radius={[4, 4, 0, 0]} />
            <Bar isAnimationActive={false} dataKey="nonEmergencyBreaches" fill="var(--color-nonEmergencyBreaches)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
