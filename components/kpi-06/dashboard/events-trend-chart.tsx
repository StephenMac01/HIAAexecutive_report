"use client"

import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { KPI, type WeekDerived } from "@/lib/kpi-06/kpi-data"

const chartConfig = {
  events: { label: "Events", color: "var(--chart-1)" },
}

export function EventsTrendChart({ weeks }: { weeks: WeekDerived[] }) {
  const data = weeks.map((w) => ({
    label: w.label,
    period: w.period,
    events: w.events,
    damagePoints: w.damagePoints,
  }))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Events by Period</CardTitle>
        <CardDescription>
          Weekly events: late invoices + incorrect invoices unrectified after 30 days. Target is {KPI.target}; any
          event is a fail.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
            <ReferenceLine
              y={KPI.failThreshold}
              stroke="var(--destructive)"
              strokeDasharray="4 4"
              label={{ value: "Fail ≥ 1", position: "insideTopRight", fill: "var(--destructive)", fontSize: 11 }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelKey="period"
                  formatter={(value, _name, item) => (
                    <div className="flex w-full flex-col gap-0.5">
                      <span className="font-medium text-foreground">{item.payload.period}</span>
                      <span className="text-muted-foreground">
                        {value} event{value === 1 ? "" : "s"} · {item.payload.damagePoints} damage points
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="events" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((d) => (
                <Cell key={d.label} fill={d.events > 0 ? "var(--destructive)" : "var(--chart-1)"} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
