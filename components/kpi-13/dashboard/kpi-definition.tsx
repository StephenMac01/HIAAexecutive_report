import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { KPI_META } from "@/lib/kpi-13/kpi-data"

export function KpiDefinition() {
  const thresholds = [
    { label: "Fail", value: KPI_META.failThreshold.toString(), tone: "danger" },
    { label: "Target", value: KPI_META.target.toString(), tone: "ok" },
    { label: "Success", value: "n/a", tone: "neutral" },
  ] as const

  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI Definition</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{KPI_META.calculation}</p>

        <div className="grid grid-cols-3 gap-3">
          {thresholds.map((t) => (
            <div
              key={t.label}
              className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted/40 px-3 py-3 text-center"
            >
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{t.label}</span>
              <span
                className={`text-lg font-bold ${
                  t.tone === "danger"
                    ? "text-destructive"
                    : t.tone === "ok"
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {t.value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-lg bg-primary px-4 py-3 text-primary-foreground">
          <span className="text-sm font-medium">Damage points</span>
          <span className="text-sm font-semibold">
            {KPI_META.damagePointsPerEvent} per event
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
