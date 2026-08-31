"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ResponsiveChart } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Row = { name: string; value: number }

export function LeadChart({ data }: { data: Row[] }) {
  const max = Math.max(...data.map((d) => d.value))
  return (
    <Card>
      <CardHeader>
        <CardTitle>Events by Team Lead</CardTitle>
        <CardDescription>Attribution of unreported incidents across team leads</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveChart>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={92}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  color: "var(--popover-foreground)",
                  fontSize: 12,
                }}
              />
              <Bar isAnimationActive={false} dataKey="value" name="Events" radius={[0, 4, 4, 0]}>
                {data.map((d) => (
                  <Cell
                    key={d.name}
                    fill={d.value === max ? "var(--chart-3)" : "var(--chart-1)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveChart>
        </div>
      </CardContent>
    </Card>
  )
}
