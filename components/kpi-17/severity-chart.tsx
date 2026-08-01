"use client"

import { Cell, Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { NamedCount } from "@/lib/kpi-17/kpi"

const config = {
  value: { label: "Events" },
  High: { label: "High", color: "var(--chart-4)" },
  Medium: { label: "Medium", color: "var(--chart-3)" },
  Low: { label: "Low", color: "var(--chart-2)" },
}

const toneMap: Record<string, string> = {
  High: "var(--chart-4)",
  Medium: "var(--chart-3)",
  Low: "var(--chart-2)",
}

export function SeverityChart({ bySeverity }: { bySeverity: NamedCount[] }) {
  const total = bySeverity.reduce((s, d) => s + d.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Severity Mix</CardTitle>
        <CardDescription>Event breakdown by severity rating</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="mx-auto h-[260px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            <Pie data={bySeverity} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={2}>
              {bySeverity.map((entry) => (
                <Cell key={entry.name} fill={toneMap[entry.name]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-2 flex items-center justify-center gap-4 text-sm">
          {bySeverity.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: toneMap[entry.name] }}
                aria-hidden="true"
              />
              <span className="text-muted-foreground">
                {entry.name} · {total > 0 ? Math.round((entry.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
