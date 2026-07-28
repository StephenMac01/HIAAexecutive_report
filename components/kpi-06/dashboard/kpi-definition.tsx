import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { KPI } from "@/lib/kpi-06/kpi-data"

export function KpiDefinition() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Definition & Scoring</CardTitle>
        <CardDescription>{KPI.id} — {KPI.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground text-pretty leading-relaxed">
          All hours invoiced from the Contractor to HIAA shall be on time, accurate, and reflect actual personnel
          working and the quantity of hours providing the Services.
        </p>
        <ul className="space-y-2">
          <li className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-chart-1" aria-hidden />
            <span className="text-muted-foreground text-pretty">
              A <span className="font-medium text-foreground">late invoice</span> is counted as one (1) event.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-chart-5" aria-hidden />
            <span className="text-muted-foreground text-pretty">
              An <span className="font-medium text-foreground">incorrect invoice not rectified after 30 days</span> is
              counted as one (1) event.
            </span>
          </li>
        </ul>

        <Separator />

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-destructive/10 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Fail</p>
            <p className="mt-1 font-mono text-2xl font-bold text-destructive">{KPI.failThreshold}</p>
          </div>
          <div className="rounded-md bg-chart-1/10 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Target</p>
            <p className="mt-1 font-mono text-2xl font-bold text-chart-1">{KPI.target}</p>
          </div>
          <div className="rounded-md bg-chart-1/10 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Success</p>
            <p className="mt-1 font-mono text-2xl font-bold text-chart-1">0</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
          <span className="text-muted-foreground">Damage points</span>
          <span className="font-medium text-foreground">{KPI.damagePerEvent} per event</span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
          <span className="text-muted-foreground">Advantage points</span>
          <span className="font-medium text-foreground">n/a</span>
        </div>
      </CardContent>
    </Card>
  )
}
