"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { KpiContribution, MonthlyPoints } from "@/lib/executive-summary/types"

const pointsConfig = {
  damage: { label: "Damage", color: "var(--destructive)" },
  advantage: { label: "Advantage", color: "var(--success)" },
  net: { label: "Net damage", color: "var(--chart-2)" },
  rolling: { label: "Rolling 6-mo", color: "var(--aviation)" },
} satisfies ChartConfig

export function PortfolioTrendCharts({
  portfolioMonthly,
  rollingWindow,
  contributions,
  defaultThreshold,
}: {
  portfolioMonthly: MonthlyPoints[]
  rollingWindow: MonthlyPoints[]
  contributions: KpiContribution[]
  defaultThreshold: number
}) {
  // Build a rolling-6-month cumulative series from the portfolio timeline.
  const rolling = portfolioMonthly.map((m, i) => {
    const window = portfolioMonthly.slice(Math.max(0, i - 5), i + 1)
    return { label: m.label, rolling: window.reduce((s, w) => s + w.net, 0) }
  })

  const statusMix = (["green", "amber", "red"] as const).map((s) => ({
    status: s,
    label: s === "green" ? "On Target" : s === "amber" ? "At Risk" : "Breach",
    count: contributions.filter((c) => c.status === s).length,
    fill: s === "green" ? "var(--success)" : s === "amber" ? "var(--warning)" : "var(--destructive)",
  }))

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 print:grid-cols-2">
      <Card className="report-section border-navy/10">
        <CardHeader>
          <CardTitle className="text-base text-navy">Monthly Damage vs Advantage</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={pointsConfig} className="h-[240px] w-full">
            <BarChart data={portfolioMonthly} margin={{ left: 4, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar isAnimationActive={false} dataKey="damage" fill="var(--color-damage)" radius={[3, 3, 0, 0]} />
              <Bar isAnimationActive={false} dataKey="advantage" fill="var(--color-advantage)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="report-section border-navy/10">
        <CardHeader>
          <CardTitle className="text-base text-navy">Net Damage Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={pointsConfig} className="h-[240px] w-full">
            <AreaChart data={portfolioMonthly} margin={{ left: 4, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="es-net" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-net)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-net)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area isAnimationActive={false} type="monotone" dataKey="net" stroke="var(--color-net)" strokeWidth={2} fill="url(#es-net)" />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="report-section border-navy/10">
        <CardHeader>
          <CardTitle className="text-base text-navy">Rolling 6-Month Damage vs Default Threshold</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={pointsConfig} className="h-[240px] w-full">
            <LineChart data={rolling} margin={{ left: 4, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={32} domain={[0, Math.max(defaultThreshold + 50, 100)]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ReferenceLine
                y={defaultThreshold}
                stroke="var(--destructive)"
                strokeDasharray="4 4"
                label={{ value: `Default ${defaultThreshold}`, position: "insideTopRight", fontSize: 10, fill: "var(--destructive)" }}
              />
              <Line isAnimationActive={false} type="monotone" dataKey="rolling" stroke="var(--color-rolling)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="report-section border-navy/10">
        <CardHeader>
          <CardTitle className="text-base text-navy">KPI Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center">
          <ChartContainer config={pointsConfig} className="mx-auto h-[240px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
              <Pie isAnimationActive={false} data={statusMix} dataKey="count" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {statusMix.map((s) => (
                  <Cell key={s.status} fill={s.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="flex flex-col gap-2 pr-4">
            {statusMix.map((s) => (
              <div key={s.status} className="flex items-center gap-2">
                <span className="size-3 rounded-sm" style={{ backgroundColor: s.fill }} aria-hidden />
                <span className="text-sm text-foreground">{s.label}</span>
                <span className="text-sm font-semibold tabular-nums text-muted-foreground">{s.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
