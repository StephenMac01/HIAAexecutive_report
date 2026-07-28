"use client"

import { Label, Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { Totals } from "@/lib/kpi-06/kpi-data"

const chartConfig = {
  count: { label: "Events" },
  late: { label: "Late invoice", color: "var(--chart-1)" },
  notRectified: { label: "Unrectified > 30d", color: "var(--chart-5)" },
}

export function EventBreakdownChart({ totals }: { totals: Totals }) {
  const data = [
    { key: "late", label: "Late invoice", count: totals.late, fill: "var(--chart-1)" },
    { key: "notRectified", label: "Unrectified > 30d", count: totals.notRectified, fill: "var(--chart-5)" },
  ]
  const totalEvents = totals.events

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Events by Cause</CardTitle>
        <CardDescription>Root cause split across the trailing 26 weeks.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[190px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
            <Pie data={data} dataKey="count" nameKey="label" innerRadius={55} outerRadius={80} strokeWidth={2}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground font-mono text-3xl font-bold">
                          {totalEvents}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 20} className="fill-muted-foreground text-xs">
                          total events
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="grid w-full grid-cols-2 gap-3">
          {data.map((d) => (
            <div key={d.key} className="rounded-md border border-border p-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.fill }} aria-hidden />
                <span className="text-xs text-muted-foreground">{d.label}</span>
              </div>
              <p className="mt-1 font-mono text-xl font-semibold tabular-nums">{d.count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
