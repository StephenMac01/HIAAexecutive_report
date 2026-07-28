import { CheckCircle2 } from "lucide-react"
import { auditLog } from "@/lib/kpi-10/kpi-data"

export function AuditLog() {
  return (
    <section
      aria-label="Recent audit checkpoints"
      className="rounded-xl border border-border bg-card shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Recent audit checkpoints
          </h3>
          <p className="text-xs text-muted-foreground">
            Today&apos;s on-site uniform inspections
          </p>
        </div>
        <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
          All passed
        </span>
      </div>

      <ul className="divide-y divide-border">
        {auditLog.map((entry, i) => (
          <li
            key={`${entry.zone}-${i}`}
            className="flex items-center gap-4 px-5 py-3"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {entry.zone}
              </p>
              <p className="text-xs text-muted-foreground">
                {entry.checked} personnel checked · {entry.inspector}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm text-foreground">{entry.time}</p>
              <p className="text-xs font-medium text-success">Pass · 0 events</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
