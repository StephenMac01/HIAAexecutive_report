"use client"

import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { KPI_META, type MonthlyPoint } from "@/lib/kpi-03/kpi-data"

const chartConfig = {
  avgStaffing: { label: "Avg. staffing", color: "var(--chart-1)" },
  minStaffing: { label: "Minimum required", color: "var(--chart-3)" },
} satisfies ChartConfig

export function StaffingChart({ monthly }: { monthly: MonthlyPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Staffing vs. Minimum</CardTitle>
        <CardDescription>
          Monthly average post staffing against the HIAA minimum of {KPI_META.minimumStaffing}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
          <AreaChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillStaffing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-avgStaffing)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-avgStaffing)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              domain={[10, 14]}
              tickCount={5}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={36}
            />
            <ReferenceLine
              y={KPI_META.minimumStaffing}
              stroke="var(--chart-3)"
              strokeDasharray="5 4"
              label={{
                value: `Min ${KPI_META.minimumStaffing}`,
                position: "insideTopRight",
                fill: "var(--chart-3)",
                fontSize: 11,
              }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="avgStaffing"
              type="monotone"
              stroke="var(--color-avgStaffing)"
              strokeWidth={2}
              fill="url(#fillStaffing)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
