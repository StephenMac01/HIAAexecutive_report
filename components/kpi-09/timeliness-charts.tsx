"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ResponsiveChart } from "@/components/ui/chart"
import { type MonthlySummary } from "@/lib/kpi-09/kpi-data"

const axisStyle = { fontSize: 12, fill: "var(--muted-foreground)" }

function ChartCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 h-64">{children}</div>
    </div>
  )
}

function TooltipBox({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
  unit: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-popover-foreground">{label}</p>
      <p className="text-muted-foreground">
        {payload[0].value} {unit}
      </p>
    </div>
  )
}

export function EventsTrendChart({ data }: { data: MonthlySummary[] }) {
  return (
    <ChartCard
      title="Events by month"
      description="Material delivery failures. Target line is zero."
    >
      <ResponsiveChart>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" tick={axisStyle} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} />
          <ReferenceLine y={0} stroke="var(--chart-5)" strokeWidth={2} />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            content={<TooltipBox unit="event(s)" />}
          />
          <Bar isAnimationActive={false} dataKey="events" radius={[4, 4, 0, 0]} maxBarSize={36}>
            {data.map((entry) => (
              <Cell
                key={entry.month}
                fill={entry.events > 0 ? "var(--destructive)" : "var(--accent)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveChart>
    </ChartCard>
  )
}

export function DamagePointsChart({ data }: { data: MonthlySummary[] }) {
  return (
    <ChartCard
      title="Damage points by month"
      description="10 damage points accrue per recorded event."
    >
      <ResponsiveChart>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" tick={axisStyle} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} />
          <Tooltip content={<TooltipBox unit="damage points" />} />
          <Line isAnimationActive={false}
            type="monotone"
            dataKey="damagePoints"
            stroke="var(--primary)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--primary)" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveChart>
    </ChartCard>
  )
}
