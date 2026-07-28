"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { NamedCount } from "@/lib/kpi-17/kpi"

const config = {
  value: { label: "Events", color: "var(--chart-2)" },
}

export function ElementChart({ byElement }: { byElement: NamedCount[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Events by Safety Element</CardTitle>
        <CardDescription>Which parts of the plan were not adhered to</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[320px] w-full">
          <BarChart
            data={byElement}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={150}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} maxBarSize={22} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
