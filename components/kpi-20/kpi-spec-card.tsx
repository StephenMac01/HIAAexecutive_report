import type { Threshold } from "@/lib/kpi-20/kpi"

type KpiSpecCardProps = {
  kpi: string
  title: string
  threshold: Threshold
  damagePerEvent: number
}

export function KpiSpecCard({ kpi, title, threshold, damagePerEvent }: KpiSpecCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-stretch border-b border-[oklch(1_0_0/0.15)] bg-primary text-primary-foreground">
        <div className="w-40 shrink-0 border-r border-[oklch(1_0_0/0.15)] px-4 py-3 font-mono text-sm font-bold tracking-wide">
          {kpi}
        </div>
        <div className="flex flex-1 items-center px-4 py-3 text-sm font-semibold tracking-wide">
          {title}
        </div>
      </div>

      {/* Calculation */}
      <div className="flex items-stretch border-b border-border text-sm">
        <div className="flex w-40 shrink-0 items-center border-r border-border bg-accent px-4 py-3 font-medium text-accent-foreground">
          Calculation
        </div>
        <p className="flex-1 px-4 py-3 leading-relaxed text-foreground">
          All Response Team members are required to have and maintain an AVOP DA. The minimum required D drivers
          per shift is two (2). The Contractor must provide a report of the number of shifts where the number of D
          drivers on shift was less than 2. Each shift not meeting minimum requirements will count as one (1) event.
        </p>
      </div>

      {/* Threshold */}
      <div className="flex items-stretch border-b border-border text-sm">
        <div className="flex w-40 shrink-0 items-center border-r border-border bg-accent px-4 py-3 font-medium text-accent-foreground">
          Threshold
        </div>
        <div className="grid flex-1 grid-cols-3 divide-x divide-border">
          <ThresholdCell label="Fail" value={threshold.fail} />
          <ThresholdCell label="Target" value={threshold.target} />
          <ThresholdCell label="Success" value={threshold.success} />
        </div>
      </div>

      {/* Damage points */}
      <div className="flex items-stretch text-sm">
        <div className="flex w-40 shrink-0 items-center border-r border-border bg-accent px-4 py-3 font-medium text-accent-foreground">
          Damage points
        </div>
        <div className="grid flex-1 grid-cols-2 divide-x divide-border">
          <div className="px-4 py-3">
            <span className="font-semibold text-foreground">{damagePerEvent} per event</span>
          </div>
          <div className="px-4 py-3">
            <span className="text-muted-foreground">Advantage Points: </span>
            <span className="font-semibold text-foreground">n/a</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ThresholdCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="rounded bg-secondary px-2 py-0.5 font-mono text-sm font-semibold text-secondary-foreground">
        {value}
      </span>
    </div>
  )
}
