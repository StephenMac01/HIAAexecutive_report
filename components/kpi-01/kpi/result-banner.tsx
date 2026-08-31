import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { kpiMeta, type Kpi01Summary } from "@/lib/kpi-01/kpi-data"
import { cn } from "@/lib/utils"

export function ResultBanner({ summary }: { summary: Kpi01Summary }) {
  const failed = summary.result === "FAIL"
  const overBy = summary.counted - kpiMeta.failThreshold

  return (
    <Card
      className={cn(
        "overflow-hidden border-l-4 p-0",
        failed ? "border-l-destructive" : "border-l-success",
      )}
    >
      <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr] md:items-center md:gap-8">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full",
              failed ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success",
            )}
          >
            {failed ? (
              <AlertTriangle className="h-8 w-8" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">KPI Result</p>
            <p
              className={cn(
                "text-3xl font-bold tracking-tight",
                failed ? "text-destructive" : "text-success",
              )}
            >
              {summary.result}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-4 sm:grid-cols-4 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <Metric label="Counted Events" value={summary.counted} tone="strong" />
          <Metric label="Target" value={kpiMeta.target} />
          <Metric label="Fail Threshold" value={`≥ ${kpiMeta.failThreshold}`} />
          <Metric
            label="Over Threshold"
            value={overBy > 0 ? `+${overBy}` : "0"}
            tone={overBy > 0 ? "bad" : "good"}
          />
        </div>
      </div>
      <p className="border-t border-border bg-muted/40 px-6 py-3 text-sm leading-relaxed text-muted-foreground">
        {failed
          ? `${summary.counted} substantiated material events were counted against a target of ${kpiMeta.target}. Any count of ${kpiMeta.failThreshold} or more is a fail — resulting in ${summary.totalDamagePoints} Damage Points (${kpiMeta.damagePointsPerEvent} per counted event).`
          : `No substantiated material events were counted this period. The KPI target of ${kpiMeta.target} was met.`}
      </p>
    </Card>
  )
}

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string | number
  tone?: "default" | "strong" | "bad" | "good"
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          tone === "bad" && "text-destructive",
          tone === "good" && "text-success",
          tone === "strong" && "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  )
}
