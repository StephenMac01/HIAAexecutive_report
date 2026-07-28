"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Row = { name: string; value: number }

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-4)", "var(--chart-5)"]

export function BreakdownChart({
  title,
  description,
  data,
}: {
  title: string
  description: string
  data: Row[]
}) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative h-48 w-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={54}
                outerRadius={80}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((d, i) => (
                  <Cell key={d.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  color: "var(--popover-foreground)",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums">{total}</span>
            <span className="text-xs text-muted-foreground">events</span>
          </div>
        </div>
        <ul className="flex w-full flex-col gap-2">
          {data.map((d, i) => (
            <li key={d.name} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-sm"
                  style={{ background: COLORS[i % COLORS.length] }}
                  aria-hidden="true"
                />
                <span className="text-muted-foreground">{d.name}</span>
              </span>
              <span className="font-semibold tabular-nums">
                {d.value}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  ({Math.round((d.value / total) * 100)}%)
                </span>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
