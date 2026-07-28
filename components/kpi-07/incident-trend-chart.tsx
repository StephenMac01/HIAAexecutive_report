"use client"

import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { MonthlyDatum } from "@/lib/kpi-07/kpi-data"

const chartConfig = {
  incidents: { label: "Incidents", color: "var(--chart-2)" },
}

export function IncidentTrendChart({ monthlyIncidents }: { monthlyIncidents: MonthlyDatum[] }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Monthly Incident Count</CardTitle>
        <CardDescription>
          Target is 0 — the dashed line marks the compliance boundary. Any bar above it is a Fail.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart accessibilityLayer data={monthlyIncidents} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} width={32} />
            <ReferenceLine
              y={0}
              stroke="var(--chart-3)"
              strokeDasharray="4 4"
              label={{ value: "Target", position: "insideTopLeft", fill: "var(--chart-3)", fontSize: 11 }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="incidents" radius={[4, 4, 0, 0]} maxBarSize={44}>
              {monthlyIncidents.map((entry) => (
                <Cell
                  key={entry.month}
                  fill={entry.incidents > 0 ? "var(--chart-2)" : "var(--chart-3)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
