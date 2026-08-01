"use client"

import {
  Bar,
  Cell,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { STATUS_META, type StaffingRecord } from "@/lib/kpi-21/kpi"

const STATUS_FILL: Record<string, string> = {
  success: "var(--color-success)",
  target: "var(--color-warning)",
  fail: "var(--color-destructive)",
}

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const r: StaffingRecord = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-semibold text-popover-foreground">{r.label}</p>
      <p className="text-muted-foreground">
        Fill rate: <span className="font-medium text-foreground">{r.fillRate}%</span>
      </p>
      <p className="text-muted-foreground">
        {r.shiftsFilled} / {r.shiftsScheduled} shifts · {STATUS_META[r.status].label}
      </p>
      <p className="text-muted-foreground">
        Points:{" "}
        <span className={r.netPoints >= 0 ? "text-success" : "text-destructive"}>
          {r.netPoints > 0 ? "+" : ""}
          {r.netPoints}
        </span>
      </p>
    </div>
  )
}

export function FillRateChart({ records }: { records: StaffingRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Shift Fill Rate</CardTitle>
        <CardDescription>
          Bars are colored by threshold band. Red zone ≤75% (Fail), amber 76–90% (Target), green ≥91% (Success).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 200 }}>
            <ComposedChart data={records} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <ReferenceArea y1={0} y2={75} fill="var(--color-destructive)" fillOpacity={0.06} />
              <ReferenceArea y1={76} y2={90} fill="var(--color-warning)" fillOpacity={0.08} />
              <ReferenceArea y1={91} y2={100} fill="var(--color-success)" fillOpacity={0.08} />
              <ReferenceLine y={75} stroke="var(--color-destructive)" strokeDasharray="4 4" strokeOpacity={0.5} />
              <ReferenceLine y={91} stroke="var(--color-success)" strokeDasharray="4 4" strokeOpacity={0.5} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)" }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 91, 100]}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-muted)", fillOpacity: 0.4 }} />
              <Bar dataKey="fillRate" radius={[4, 4, 0, 0]} maxBarSize={44}>
                {records.map((r) => (
                  <Cell key={r.month} fill={STATUS_FILL[r.status]} />
                ))}
              </Bar>
              <Line
                type="monotone"
                dataKey="fillRate"
                stroke="var(--color-chart-5)"
                strokeWidth={1.5}
                strokeOpacity={0.6}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
