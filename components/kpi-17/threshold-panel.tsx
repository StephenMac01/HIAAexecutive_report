import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { KpiData } from "@/lib/kpi-17/kpi"

function ThresholdCell({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "fail" | "target" | "success"
}) {
  const toneClasses = {
    fail: "border-destructive/40 bg-destructive/10 text-destructive",
    target: "border-chart-5/40 bg-chart-5/10 text-chart-5",
    success: "border-border bg-muted text-muted-foreground",
  }[tone]

  return (
    <div className={`flex flex-col items-center gap-1 rounded-md border px-3 py-4 ${toneClasses}`}>
      <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold tabular-nums">{value}</span>
    </div>
  )
}

export function ThresholdPanel({ data }: { data: KpiData }) {
  const isFail = data.resultVsTarget === "Fail"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">Calculation & Thresholds</CardTitle>
        <Badge
          className={
            isFail
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-chart-5/40 bg-chart-5/10 text-chart-5"
          }
          variant="outline"
        >
          {isFail ? "Fail" : "Target Met"}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          The Contractor is provided the HIAA contractor safety plan that must be adhered to. Any element of the
          contractor safety program not adhered to will count as one (1) event.
        </p>

        <div className="grid grid-cols-3 gap-3">
          <ThresholdCell label="Fail" value="1" tone="fail" />
          <ThresholdCell label="Target" value="0" tone="target" />
          <ThresholdCell label="Success" value="n/a" tone="success" />
        </div>

        <dl className="grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">Damage Points</dt>
            <dd className="font-semibold text-foreground">25 per event</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">Advantage Points</dt>
            <dd className="font-semibold text-foreground">n/a</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
