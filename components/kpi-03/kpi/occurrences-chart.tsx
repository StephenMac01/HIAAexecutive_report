"use client"

import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { KPI_META, type MonthlyPoint } from "@/lib/kpi-03/kpi-data"

const chartConfig = {
  occurrences: { label: "Occurrences", color: "var(--chart-1)" },
} satisfies ChartConfig

export function OccurrencesChart({ monthly }: { monthly: MonthlyPoint[] }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Below-Minimum Occurrences by Month</CardTitle>
        <CardDescription>
          Each occurrence is counted as one (1). Any month above the dashed line is a Fail.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
          <BarChart data={monthly} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={32}
            />
            <ReferenceLine
              y={KPI_META.threshold.fail}
              stroke="var(--destructive)"
              strokeDasharray="5 4"
              label={{
                value: `Fail ≥ ${KPI_META.threshold.fail}`,
                position: "right",
                fill: "var(--destructive)",
                fontSize: 11,
              }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="occurrences" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {monthly.map((m) => (
                <Cell
                  key={m.month}
                  fill={m.occurrences === 0 ? "var(--chart-5)" : "var(--chart-3)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-[var(--chart-5)]" /> Compliant (0)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-[var(--chart-3)]" /> Fail (≥ 1)
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
