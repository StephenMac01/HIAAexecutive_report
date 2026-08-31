import { CheckCircle2, Target } from "lucide-react"
import { kpiMeta, type CurrentPeriod } from "@/lib/kpi-10/kpi-data"

export function StatusBanner({ currentPeriod }: { currentPeriod: CurrentPeriod }) {
  const { events, complianceRate, consecutiveCleanDays } = currentPeriod

  return (
    <section
      aria-label="Current compliance status"
      className="overflow-hidden rounded-xl border border-success/30 bg-card shadow-sm"
    >
      <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-success/10 ring-1 ring-success/30">
            <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                <Target className="h-3.5 w-3.5" aria-hidden="true" />
                ON TARGET
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance">
              {events} non-compliant uniform events
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground text-pretty">
              Target of {kpiMeta.threshold.target} events met. No damage points
              incurred this period — every individual on-site is in an HIAA
              approved uniform.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-6 border-t border-border pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <div>
            <p className="font-mono text-3xl font-semibold text-success">
              {complianceRate}%
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
              Compliance rate
            </p>
          </div>
          <div>
            <p className="font-mono text-3xl font-semibold text-foreground">
              {consecutiveCleanDays}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
              Clean days
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
