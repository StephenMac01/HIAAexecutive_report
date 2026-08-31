import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function ThresholdPill({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "fail" | "target" | "muted"
}) {
  const toneClass =
    tone === "fail"
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : tone === "target"
        ? "border-chart-3/40 bg-chart-3/10 text-chart-3"
        : "border-border bg-muted text-muted-foreground"
  return (
    <div className={`flex items-center justify-between rounded-lg border px-3 py-2 ${toneClass}`}>
      <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  )
}

export function KpiDefinition() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Metric definition</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Calculation</span>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            Any untrained personnel working or unqualified personnel filling a post is counted as one (1) event.
          </p>
        </div>

        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Threshold</span>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <ThresholdPill label="Fail" value="1" tone="fail" />
            <ThresholdPill label="Target" value="0" tone="target" />
            <ThresholdPill label="Success" value="n/a" tone="muted" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Damage points</span>
            <p className="mt-1 text-sm font-semibold text-foreground">25 per event</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Advantage points</span>
            <p className="mt-1 text-sm font-semibold text-foreground">n/a</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
