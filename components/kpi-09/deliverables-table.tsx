import { type Deliverable } from "@/lib/kpi-09/kpi-data"
import { cn } from "@/lib/utils"

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function DeliverablesTable({
  deliverables,
  periodLabel,
}: {
  deliverables: Deliverable[]
  periodLabel: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <h3 className="text-base font-semibold text-foreground">Deliverables — {periodLabel}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Each material failure to deliver on the required timeline counts as one (1) event.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Deliverable</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Due</th>
              <th className="px-5 py-3 font-medium">Delivered</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Damage pts</th>
            </tr>
          </thead>
          <tbody>
            {deliverables.map((d) => (
              <tr key={d.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3">
                  <p className="font-medium text-foreground">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.id}</p>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{d.category}</td>
                <td className="px-5 py-3 text-muted-foreground">{formatDate(d.dueDate)}</td>
                <td className="px-5 py-3 text-muted-foreground">{formatDate(d.deliveredDate)}</td>
                <td className="px-5 py-3">
                  <StatusBadge
                    deliveredDate={d.deliveredDate}
                    isEvent={d.isEvent}
                    daysLate={d.daysLate}
                  />
                </td>
                <td className="px-5 py-3 text-right">
                  <span
                    className={cn(
                      "font-semibold",
                      d.isEvent ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {d.isEvent ? d.damagePoints : 0}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({
  deliveredDate,
  isEvent,
  daysLate,
}: {
  deliveredDate: string | null
  isEvent: boolean
  daysLate: number
}) {
  if (!deliveredDate) {
    return (
      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        Pending
      </span>
    )
  }
  if (isEvent) {
    return (
      <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
        Event · {daysLate}d late
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-chart-5/10 px-2.5 py-0.5 text-xs font-medium text-chart-5">
      On time
    </span>
  )
}
