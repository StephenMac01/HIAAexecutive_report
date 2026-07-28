"use client"

import { Label, Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { TypeSlice } from "@/lib/kpi-05/kpi-types"

const chartConfig = {
  count: { label: "Events" },
  untrained: { label: "Untrained working", color: "var(--chart-1)" },
  unqualified: { label: "Unqualified filling post", color: "var(--chart-4)" },
} satisfies ChartConfig

export function TypeBreakdownChart({ data: raw }: { data: TypeSlice[] }) {
  const total = raw.reduce((sum, s) => sum + s.count, 0)
  const data = raw.map((s) => ({
    key: s.key,
    label: s.type,
    count: s.count,
    fill: s.key === "untrained" ? "var(--color-untrained)" : "var(--color-unqualified)",
  }))

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">Events by type</CardTitle>
        <CardDescription>Split of the two counted event categories</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-64">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="label" hideLabel />} />
            <Pie data={data} dataKey="count" nameKey="label" innerRadius={60} strokeWidth={4}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-semibold">
                          {total}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 22} className="fill-muted-foreground text-xs">
                          Total events
                        </tspan>
                      </text>
                    )
                  }
                  return null
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-2 flex flex-col gap-2">
          {data.map((s) => (
            <div key={s.key} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: s.fill }} aria-hidden="true" />
                {s.label}
              </span>
              <span className="font-medium tabular-nums text-foreground">{s.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
