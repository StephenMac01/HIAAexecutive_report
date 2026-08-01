import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { kpi } from "@/lib/kpi-19/kpi-data"

function ThresholdCell({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border p-3">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={`text-lg font-bold tabular-nums ${tone}`}>{value}</span>
    </div>
  )
}

export function SpecPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI Definition</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Calculation</p>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-foreground">{kpi.calculation}</p>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Threshold</p>
          <div className="grid grid-cols-3 gap-3">
            <ThresholdCell label="Fail" value={kpi.thresholdFail} tone="text-destructive" />
            <ThresholdCell label="Target" value={kpi.thresholdTarget} tone="text-emerald-600" />
            <ThresholdCell label="Success" value={kpi.thresholdSuccess} tone="text-muted-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ThresholdCell label="Damage Points" value={`${kpi.damagePointsPerEvent} / event`} tone="text-foreground" />
          <ThresholdCell label="Advantage Points" value={kpi.advantagePoints} tone="text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}
