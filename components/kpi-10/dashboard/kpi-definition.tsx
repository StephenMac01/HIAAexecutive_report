import { kpiMeta } from "@/lib/kpi-10/kpi-data"

export function KpiDefinition() {
  return (
    <section
      aria-label="KPI definition"
      className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    >
      <div className="flex items-center justify-between bg-primary px-5 py-3 text-primary-foreground">
        <h3 className="text-sm font-semibold tracking-wide">
          <span className="font-mono">{kpiMeta.id}</span> — {kpiMeta.name}
        </h3>
        <span className="text-xs text-primary-foreground/70">Definition</span>
      </div>

      <dl className="divide-y divide-border text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr]">
          <dt className="bg-accent/10 px-5 py-3 font-medium text-accent">
            Calculation
          </dt>
          <dd className="px-5 py-3 leading-relaxed text-foreground">
            {kpiMeta.calculation}
          </dd>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr]">
          <dt className="bg-accent/10 px-5 py-3 font-medium text-accent">
            Threshold
          </dt>
          <dd className="px-5 py-3">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                Fail <span className="font-mono font-semibold">{kpiMeta.threshold.fail}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                Target <span className="font-mono font-semibold">{kpiMeta.threshold.target}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                Success <span className="font-mono font-semibold">{kpiMeta.threshold.success}</span>
              </span>
            </div>
          </dd>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr]">
          <dt className="bg-accent/10 px-5 py-3 font-medium text-accent">
            Scoring
          </dt>
          <dd className="px-5 py-3">
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              <span className="text-foreground">
                Damage points:{" "}
                <span className="font-medium">
                  {kpiMeta.damagePointsPerEvent} per event
                </span>
              </span>
              <span className="text-foreground">
                Advantage points:{" "}
                <span className="font-medium">{kpiMeta.advantagePoints}</span>
              </span>
            </div>
          </dd>
        </div>
      </dl>
    </section>
  )
}
