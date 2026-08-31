"use client"

import {
  Cell,
  Pie,
  PieChart,
  Tooltip,
} from "recharts"
import { ResponsiveChart } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface BreakdownItem {
  name: string
  value: number
}

const COLORS = ["var(--chart-1)", "var(--chart-3)"]

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-popover-foreground">{payload[0].name}</p>
      <p className="mt-1 text-muted-foreground">
        Events: <span className="font-mono font-semibold text-foreground">{payload[0].value}</span>
      </p>
    </div>
  )
}

export function EventBreakdownChart({ data }: { data: BreakdownItem[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-border px-5 py-4">
        <CardTitle className="text-sm font-semibold">Events by type</CardTitle>
        <CardDescription className="text-xs">Distribution of the {total} recorded events.</CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        <div className="relative h-48 w-full">
          <ResponsiveChart>
            <PieChart>
              <Tooltip content={<ChartTooltip />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={54}
                outerRadius={80}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveChart>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-semibold tabular-nums">{total}</span>
            <span className="text-xs text-muted-foreground">events</span>
          </div>
        </div>
        <ul className="mt-4 space-y-2">
          {data.map((entry, i) => (
            <li key={entry.name} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {entry.name}
              </span>
              <span className="font-mono font-medium tabular-nums text-foreground">{entry.value}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
