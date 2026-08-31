import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { KpiStatusBadge } from "@/components/kpi-02/kpi-status-badge"
import { kpiOverview } from "@/lib/kpi-02/kpi-data"

export function KpiScorecard() {
  return (
    <section aria-labelledby="scorecard-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 id="scorecard-heading" className="text-sm font-medium text-muted-foreground">
          Performance scorecard
        </h2>
        <span className="text-xs text-muted-foreground">6 KPIs tracked</span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpiOverview.map((kpi) => (
          <Card
            key={kpi.code}
            className={cn(
              "gap-0 py-0 transition-colors",
              kpi.active
                ? "border-primary/50 bg-accent/40 ring-1 ring-primary/20"
                : "hover:border-border/80",
            )}
          >
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-medium text-muted-foreground">
                  {kpi.code}
                </span>
                <KpiStatusBadge status={kpi.status} />
              </div>
              <div>
                <p className="text-sm font-medium leading-tight text-foreground text-pretty">
                  {kpi.name}
                </p>
                <p className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-semibold tabular-nums text-foreground">
                    {kpi.value}
                  </span>
                  <span className="text-xs text-muted-foreground">{kpi.unit}</span>
                </p>
              </div>
              <div className="space-y-1.5">
                <Progress value={kpi.progress} className="h-1.5" />
                <p className="text-xs text-muted-foreground">Target {kpi.target}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
