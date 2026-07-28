import { CheckCircle2, AlertTriangle } from "lucide-react"
import type { KpiSummary } from "@/lib/kpi-14/kpi"

export function StatusBanner({ summary }: { summary: KpiSummary }) {
  const passing = summary.passing
  return (
    <div
      className={`flex flex-col gap-4 rounded-lg border p-5 sm:flex-row sm:items-center sm:justify-between ${
        passing
          ? "border-success/30 bg-success/10"
          : "border-destructive/30 bg-destructive/10"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-full ${
            passing ? "bg-success text-success-foreground" : "bg-destructive text-primary-foreground"
          }`}
        >
          {passing ? <CheckCircle2 className="size-6" /> : <AlertTriangle className="size-6" />}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Current KPI Status
          </p>
          <p
            className={`text-xl font-bold ${passing ? "text-success" : "text-destructive"}`}
          >
            {summary.status}
          </p>
        </div>
      </div>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        {passing
          ? "No unauthorized document or training changes recorded. The contractor is meeting the target of 0 events."
          : `${summary.unauthorized} unauthorized change ${
              summary.unauthorized === 1 ? "event" : "events"
            } recorded — threshold breached (Fail = 1). ${summary.damagePoints} damage points accrued.`}
      </p>
    </div>
  )
}
