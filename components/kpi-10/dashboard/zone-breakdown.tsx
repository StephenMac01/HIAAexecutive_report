import { CheckCircle2 } from "lucide-react"
import { zones } from "@/lib/kpi-10/kpi-data"

export function ZoneBreakdown() {
  return (
    <section
      aria-label="Compliance by zone"
      className="rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          Compliance by zone
        </h3>
        <p className="text-xs text-muted-foreground">
          Approved uniform rate across on-site areas
        </p>
      </div>

      <ul className="space-y-3">
        {zones.map((zone) => {
          const rate = Math.round((zone.compliant / zone.personnel) * 100)
          return (
            <li key={zone.zone}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                  {zone.zone}
                </span>
                <span className="text-muted-foreground">
                  <span className="font-mono text-foreground">{zone.compliant}</span>
                  /{zone.personnel} · {rate}%
                </span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={rate}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${zone.zone} compliance`}
              >
                <div
                  className="h-full rounded-full bg-success"
                  style={{ width: `${rate}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
