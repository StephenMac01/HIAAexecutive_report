import { Card } from "@/components/ui/card"

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground">
      {children}
    </div>
  )
}

export function KpiSpecCard() {
  return (
    <Card className="overflow-hidden py-0">
      <div className="bg-primary px-4 py-3 text-primary-foreground">
        <div className="flex items-center gap-3">
          <span className="rounded bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
            KPI-18
          </span>
          <h2 className="text-sm font-semibold md:text-base">
            Team Lead failure to report to HIAA Duty Security Manager
          </h2>
        </div>
      </div>

      <dl className="divide-y divide-border">
        {/* Calculation */}
        <div className="grid grid-cols-1 sm:grid-cols-[9rem_1fr]">
          <dt className="border-b border-border sm:border-b-0 sm:border-r">
            <Label>Calculation</Label>
          </dt>
          <dd className="px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            The Team Leads are required to report security incidents and regulatory incidents to
            the HIAA Duty Security Manager as per post orders, guidance materials. Failure to report
            to DSM counts as one (1) event.
          </dd>
        </div>

        {/* Threshold */}
        <div className="grid grid-cols-1 sm:grid-cols-[9rem_1fr]">
          <dt className="border-b border-border sm:border-b-0 sm:border-r">
            <Label>Threshold</Label>
          </dt>
          <dd className="grid grid-cols-3 divide-x divide-border">
            <div className="flex flex-col items-center gap-1 px-3 py-3">
              <span className="text-xs font-medium uppercase tracking-wide text-destructive">Fail</span>
              <span className="text-lg font-bold tabular-nums">1</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-3 py-3">
              <span className="text-xs font-medium uppercase tracking-wide text-accent">Target</span>
              <span className="text-lg font-bold tabular-nums">0</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-3 py-3">
              <span className="text-xs font-medium uppercase tracking-wide text-success">Success</span>
              <span className="text-lg font-bold text-muted-foreground">n/a</span>
            </div>
          </dd>
        </div>

        {/* Damage points */}
        <div className="grid grid-cols-1 sm:grid-cols-[9rem_1fr]">
          <dt className="border-b border-border sm:border-b-0 sm:border-r">
            <Label>Damage points</Label>
          </dt>
          <dd className="grid grid-cols-2 divide-x divide-border">
            <div className="flex flex-col gap-1 px-4 py-3">
              <span className="text-xs text-muted-foreground">Per event</span>
              <span className="text-lg font-bold tabular-nums">10</span>
            </div>
            <div className="flex flex-col gap-1 px-4 py-3">
              <span className="text-xs text-muted-foreground">Advantage points</span>
              <span className="text-lg font-bold text-muted-foreground">n/a</span>
            </div>
          </dd>
        </div>
      </dl>
    </Card>
  )
}
