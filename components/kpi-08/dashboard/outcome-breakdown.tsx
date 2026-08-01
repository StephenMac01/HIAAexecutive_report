"use client"

import { Label, Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { OutcomeDatum } from "@/lib/kpi-08/kpi-data"

const chartConfig = {
  count: { label: "Patrols" },
  onTime: { label: "Completed on time", color: "var(--chart-4)" },
  late: { label: "Completed late", color: "var(--chart-3)" },
  missed: { label: "Missed", color: "var(--chart-5)" },
} satisfies ChartConfig

export function OutcomeBreakdown({ outcomeSplit }: { outcomeSplit: OutcomeDatum[] }) {
  const total = outcomeSplit.reduce((sum, d) => sum + d.count, 0)
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Patrol Outcomes</CardTitle>
        <CardDescription>Completion split for the current period</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[230px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={outcomeSplit} dataKey="count" nameKey="outcome" innerRadius={62} strokeWidth={4}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-semibold">
                          {total.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
                          Patrols
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <div className="grid grid-cols-1 gap-2 px-6 pb-6 pt-2">
        {outcomeSplit.map((d) => (
          <div key={d.outcome} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: d.fill }} aria-hidden="true" />
              <span className="text-muted-foreground">{d.outcome}</span>
            </div>
            <span className="font-medium tabular-nums text-card-foreground">
              {d.count.toLocaleString()}{" "}
              <span className="text-muted-foreground">({Math.round((d.count / total) * 100)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
