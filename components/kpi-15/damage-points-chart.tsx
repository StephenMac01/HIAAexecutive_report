"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ResponsiveChart } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { WeeklyPoint } from "@/lib/kpi-15/kpi-data"

function cumulative(data: WeeklyPoint[]) {
  let running = 0
  return data.map((d) => {
    running += d.damagePoints
    return { label: d.label, cumulative: running, period: d.damagePoints }
  })
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number; dataKey: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-popover-foreground">{label}</p>
      <p className="mt-1 text-muted-foreground">
        Cumulative: <span className="font-mono font-semibold text-foreground">{payload[0].value}</span>
      </p>
    </div>
  )
}

export function DamagePointsChart({ data }: { data: WeeklyPoint[] }) {
  const series = cumulative(data)
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-border px-5 py-4">
        <CardTitle className="text-sm font-semibold">Cumulative damage points</CardTitle>
        <CardDescription className="text-xs">Running total accrued week over week.</CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        <div className="h-56 w-full">
          <ResponsiveChart>
            <AreaChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="dpFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                width={40}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#dpFill)"
              />
            </AreaChart>
          </ResponsiveChart>
        </div>
      </CardContent>
    </Card>
  )
}
