"use client"

import { Cell, Label, Pie, PieChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
const chartConfig = {
  lateReport: { label: "Late report (>5 min)", color: "var(--chart-3)" },
  noNotice: { label: "No 24h notice", color: "var(--chart-4)" },
}

type BreakdownChartProps = {
  breakdown: { key: string; label: string; value: number }[]
  total: number
}

export function BreakdownChart({ breakdown, total }: BreakdownChartProps) {
  const data = breakdown.map((t) => ({
    ...t,
    fill: t.key === "lateReport" ? "var(--chart-3)" : "var(--chart-4)",
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Breach Causes</CardTitle>
        <CardDescription>Which failure type drives the events.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-56">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={55}
              outerRadius={80}
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 18}
                          className="fill-muted-foreground text-xs"
                        >
                          events
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-4 space-y-2">
          {data.map((t) => (
            <div key={t.key} className="flex items-center gap-2 text-sm">
              <span
                className="size-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: t.fill }}
                aria-hidden="true"
              />
              <span className="flex-1 text-pretty text-muted-foreground">{t.label}</span>
              <span className="font-semibold tabular-nums text-foreground">{t.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
