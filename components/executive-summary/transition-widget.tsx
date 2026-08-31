import { CalendarClock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiStatusBadge } from "@/components/portal/kpi-chrome"
import type { TransitionState } from "@/lib/executive-summary/types"

function fmt(date: string): string {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })
}

export function TransitionWidget({ transition }: { transition: TransitionState }) {
  const { active, effectiveDate, endDate, totalMonths, monthsElapsed, monthsRemaining, progressPct } = transition

  return (
    <Card className="border-navy/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-navy">
            <CalendarClock className="size-4 text-aviation" />
            Transition Period
          </CardTitle>
          <KpiStatusBadge tone={active ? "info" : "neutral"}>{active ? "Active" : "Completed"}</KpiStatusBadge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Effective</div>
            <div className="text-sm font-medium text-foreground">{fmt(effectiveDate)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Ends</div>
            <div className="text-sm font-medium text-foreground">{fmt(endDate)}</div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Month {Math.min(monthsElapsed, totalMonths)} of {totalMonths}
            </span>
            <span className="font-medium tabular-nums text-foreground">{progressPct}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-aviation transition-all"
              style={{ width: `${progressPct}%` }}
              aria-hidden
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {active ? `${monthsRemaining} month${monthsRemaining === 1 ? "" : "s"} remaining` : "Full damage-point regime in effect"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
