"use client"

import Link from "next/link"
import { Area, AreaChart, ResponsiveContainer } from "recharts"
import { ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { KpiStatusBadge, type KpiTone } from "@/components/portal/kpi-chrome"
import { cn } from "@/lib/utils"
import type { KpiContribution, KpiStatus } from "@/lib/executive-summary/types"

const STATUS_TONE: Record<KpiStatus, KpiTone> = {
  green: "success",
  amber: "warning",
  red: "danger",
}

const STATUS_LABEL: Record<KpiStatus, string> = {
  green: "On Target",
  amber: "At Risk",
  red: "Breach",
}

const STATUS_STROKE: Record<KpiStatus, string> = {
  green: "var(--success)",
  amber: "var(--warning)",
  red: "var(--destructive)",
}

export function KpiGrid({ contributions }: { contributions: KpiContribution[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 print:grid-cols-3 print:gap-2">
      {contributions.map((c) => (
        <KpiCard key={c.id} c={c} />
      ))}
    </div>
  )
}

function KpiCard({ c }: { c: KpiContribution }) {
  const tone = STATUS_TONE[c.status]
  const spark = c.monthly.map((m, i) => ({ i, net: m.net }))
  const hasSpark = spark.some((p) => p.net !== 0)

  return (
    <Link
      href={`/kpi/${c.id}`}
      className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card
        className={cn(
          "report-section h-full overflow-hidden border-navy/10 transition-colors group-hover:border-aviation/40",
          !c.available && "opacity-70",
        )}
      >
        <CardContent className="flex h-full flex-col gap-3 pt-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-wide text-aviation">{c.code}</span>
              <span className="text-sm font-medium leading-snug text-foreground line-clamp-2">{c.name}</span>
            </div>
            <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-aviation" />
          </div>

          <div className="flex items-center justify-between">
            <KpiStatusBadge tone={tone}>{c.available ? STATUS_LABEL[c.status] : "No data"}</KpiStatusBadge>
            <span className="text-xs text-muted-foreground">{c.actual}</span>
          </div>

          <div className="h-9 w-full">
            {hasSpark ? (
              <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 200 }}>
                <AreaChart data={spark} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={`spark-${c.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={STATUS_STROKE[c.status]} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={STATUS_STROKE[c.status]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="net"
                    stroke={STATUS_STROKE[c.status]}
                    strokeWidth={1.5}
                    fill={`url(#spark-${c.id})`}
                    isAnimationActive={false}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center text-xs text-muted-foreground/70">No monthly trend</div>
            )}
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2 border-t border-border pt-2 text-center">
            <div>
              <div className="text-lg font-bold tabular-nums text-destructive">{c.monthDamage}</div>
              <div className="text-[11px] text-muted-foreground">Damage pts</div>
            </div>
            <div>
              <div className="text-lg font-bold tabular-nums text-success">{c.monthAdvantage}</div>
              <div className="text-[11px] text-muted-foreground">Advantage pts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
