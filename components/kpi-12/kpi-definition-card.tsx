import { kpiDefinition } from "@/lib/kpi-12/kpi-data"

export function KpiDefinitionCard() {
  const { code, name, definition, calculation, threshold, damagePointsPerEvent, advantagePoints } = kpiDefinition

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {/* Title row */}
      <div className="grid grid-cols-[140px_1fr]">
        <div className="flex items-center justify-center bg-primary px-4 py-3 text-primary-foreground">
          <span className="text-lg font-bold tracking-tight">{code}</span>
        </div>
        <div className="flex items-center bg-primary px-4 py-3 text-primary-foreground">
          <span className="text-lg font-bold tracking-tight">{name}</span>
        </div>
      </div>

      <DefRow label="Definition & Intent">{definition}</DefRow>
      <DefRow label="Calculation">{calculation}</DefRow>

      {/* Threshold row */}
      <div className="grid grid-cols-[140px_1fr] border-t border-border">
        <div className="flex items-center bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground">
          Threshold
        </div>
        <div className="grid grid-cols-3">
          <ThresholdCell label="Fail" value={threshold.fail} />
          <ThresholdCell label="Target" value={threshold.target} />
          <ThresholdCell label="Success" value={threshold.success} last />
        </div>
      </div>

      {/* Damage points row */}
      <div className="grid grid-cols-[140px_1fr] border-t border-border">
        <div className="flex items-center bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground">
          Damage points
        </div>
        <div className="grid grid-cols-[1fr_1fr]">
          <div className="flex items-center border-r border-border px-4 py-3 text-sm font-medium text-foreground">
            {damagePointsPerEvent} per event
          </div>
          <div className="grid grid-cols-2">
            <div className="flex items-center bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground">
              Advantage Points
            </div>
            <div className="flex items-center px-4 py-3 text-sm font-medium text-muted-foreground">
              {advantagePoints}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DefRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] border-t border-border">
      <div className="flex items-center bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground">
        {label}
      </div>
      <div className="flex items-center px-4 py-3 text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  )
}

function ThresholdCell({
  label,
  value,
  last,
}: {
  label: string
  value: string | number
  last?: boolean
}) {
  return (
    <div className={`grid grid-cols-[1fr_auto] ${last ? "" : "border-r border-border"}`}>
      <div className="flex items-center justify-center bg-accent px-3 py-3 text-sm font-semibold text-accent-foreground">
        {label}
      </div>
      <div className="flex min-w-12 items-center justify-center px-3 py-3 text-sm font-semibold text-foreground">
        {value}
      </div>
    </div>
  )
}
