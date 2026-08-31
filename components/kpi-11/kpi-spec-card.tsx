import { kpiSpec } from "@/lib/kpi-11/kpi-data"

export function KpiSpecCard() {
  return (
    <section
      aria-label="KPI-11 specification"
      className="overflow-hidden rounded-xl border border-navy/20 bg-card shadow-sm"
    >
      {/* Header row */}
      <div className="flex items-stretch border-b border-navy/20">
        <div className="flex w-32 shrink-0 items-center justify-center bg-navy px-3 py-3 text-center text-sm font-bold tracking-wide text-navy-foreground sm:w-40">
          {kpiSpec.id}
        </div>
        <div className="flex flex-1 items-center bg-navy/90 px-4 py-3 text-sm font-bold text-navy-foreground sm:text-base">
          {kpiSpec.title}
        </div>
      </div>

      {/* Calculation row */}
      <div className="flex items-stretch border-b border-border">
        <div className="flex w-32 shrink-0 items-center bg-aviation px-3 py-3 text-sm font-semibold text-aviation-foreground sm:w-40">
          Calculation
        </div>
        <div className="flex-1 px-4 py-3 text-sm leading-relaxed text-card-foreground">
          {kpiSpec.calculation}
        </div>
      </div>

      {/* Threshold row */}
      <div className="grid grid-cols-2 border-b border-border sm:grid-cols-[10rem_1fr_1fr_1fr]">
        <div className="flex items-center bg-aviation px-3 py-3 text-sm font-semibold text-aviation-foreground sm:col-span-1">
          Threshold
        </div>
        <ThresholdCell label="Fail" value={kpiSpec.threshold.fail} tone="fail" />
        <ThresholdCell label="Target" value={kpiSpec.threshold.target} tone="target" />
        <ThresholdCell label="Success" value={kpiSpec.threshold.success} tone="muted" />
      </div>

      {/* Damage points row */}
      <div className="grid grid-cols-2 sm:grid-cols-[10rem_1fr_1fr_1fr]">
        <div className="flex items-center bg-aviation px-3 py-3 text-sm font-semibold text-aviation-foreground">
          Damage points
        </div>
        <div className="flex items-center justify-center border-l border-border px-3 py-3 text-center text-sm font-semibold text-card-foreground">
          {kpiSpec.damagePointsPerEvent} per event
        </div>
        <div className="col-span-2 flex items-center justify-center gap-3 border-l border-border bg-aviation/90 px-3 py-3 text-sm font-semibold text-aviation-foreground sm:col-span-1">
          Advantage Points
        </div>
        <div className="flex items-center justify-center border-l border-border px-3 py-3 text-center text-sm text-muted-foreground">
          {kpiSpec.advantagePoints}
        </div>
      </div>
    </section>
  )
}

function ThresholdCell({
  label,
  value,
  tone,
}: {
  label: string
  value: number | string
  tone: "fail" | "target" | "muted"
}) {
  return (
    <div className="flex items-stretch border-l border-border">
      <div className="flex flex-1 items-center justify-center bg-aviation/90 px-2 py-3 text-center text-sm font-semibold text-aviation-foreground">
        {label}
      </div>
      <div
        className={`flex w-14 items-center justify-center text-sm font-bold ${
          tone === "fail"
            ? "text-destructive"
            : tone === "target"
              ? "text-success"
              : "text-muted-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  )
}
