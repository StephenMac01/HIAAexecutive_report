import { KPI } from "@/lib/kpi-14/kpi"

export function KpiScorecard() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {/* Title row */}
      <div className="grid grid-cols-[140px_1fr] border-b border-[oklch(1_0_0_/_15%)]">
        <div className="flex items-center justify-center bg-primary px-4 py-3 text-sm font-bold tracking-wide text-primary-foreground">
          {KPI.id}
        </div>
        <div className="flex items-center justify-center bg-primary px-4 py-3 text-center text-sm font-bold tracking-wide text-primary-foreground">
          {KPI.name}
        </div>
      </div>

      {/* Calculation */}
      <div className="grid grid-cols-[140px_1fr] border-b border-border">
        <div className="flex items-center bg-accent px-4 py-4 text-sm font-semibold text-accent-foreground">
          Calculation
        </div>
        <div className="px-4 py-4 text-sm leading-relaxed text-card-foreground">
          {KPI.calculation}
        </div>
      </div>

      {/* Threshold */}
      <div className="grid grid-cols-[140px_1fr] border-b border-border">
        <div className="flex items-center bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground">
          Threshold
        </div>
        <div className="grid grid-cols-2 text-sm sm:grid-cols-3">
          <ThresholdCell label="Fail" value={String(KPI.fail)} tone="destructive" />
          <ThresholdCell label="Target" value={String(KPI.target)} tone="accent" />
          <ThresholdCell label="Success" value={KPI.success} tone="muted" />
        </div>
      </div>

      {/* Damage points */}
      <div className="grid grid-cols-[140px_1fr]">
        <div className="flex items-center bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground">
          Damage points
        </div>
        <div className="grid grid-cols-1 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 px-4 py-3">
            <span className="font-semibold text-destructive">{KPI.damagePerEvent}</span>
            <span className="text-muted-foreground">per event</span>
          </div>
          <div className="flex items-center gap-2 border-t border-border px-4 py-3 sm:border-l sm:border-t-0">
            <span className="text-muted-foreground">Advantage Points</span>
            <span className="font-semibold text-card-foreground">{KPI.advantagePoints}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ThresholdCell({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "destructive" | "accent" | "muted"
}) {
  const toneClass =
    tone === "destructive"
      ? "text-destructive"
      : tone === "accent"
        ? "text-accent"
        : "text-muted-foreground"
  return (
    <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3 sm:border-l sm:border-t-0 first:sm:border-l-0">
      <span className="font-medium text-card-foreground">{label}</span>
      <span className={`font-mono text-base font-bold ${toneClass}`}>{value}</span>
    </div>
  )
}
