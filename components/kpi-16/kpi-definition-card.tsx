import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KPI_META } from "@/lib/kpi-16/kpi-data"

export function KpiDefinitionCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">KPI Definition</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-[140px_1fr]">
          <span className="text-sm font-semibold text-primary">Calculation</span>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{KPI_META.calculation}</p>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-4 border-t border-border pt-4 sm:grid-cols-[140px_1fr]">
          <span className="text-sm font-semibold text-primary">Threshold</span>
          <div className="grid grid-cols-3 overflow-hidden rounded-md border border-border">
            <ThresholdCell label="Fail" value={String(KPI_META.threshold.fail)} tone="danger" />
            <ThresholdCell label="Target" value={String(KPI_META.threshold.target)} tone="success" />
            <ThresholdCell label="Success" value={KPI_META.threshold.success} tone="muted" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-4 border-t border-border pt-4 sm:grid-cols-[140px_1fr]">
          <span className="text-sm font-semibold text-primary">Damage / Advantage</span>
          <div className="grid grid-cols-2 overflow-hidden rounded-md border border-border">
            <ThresholdCell label="Damage points" value={`${KPI_META.damagePointsPerEvent} per event`} tone="danger" />
            <ThresholdCell label="Advantage points" value={KPI_META.advantagePoints} tone="muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ThresholdCell({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "danger" | "success" | "muted"
}) {
  const valueTone =
    tone === "danger" ? "text-destructive" : tone === "success" ? "text-[var(--chart-2)]" : "text-muted-foreground"
  return (
    <div className="flex flex-col gap-1 border-r border-border bg-muted/40 px-3 py-2 last:border-r-0">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${valueTone}`}>{value}</span>
    </div>
  )
}
