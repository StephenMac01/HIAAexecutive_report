import type { MonthlyRecord, Summary } from "@/lib/kpi-11/kpi-data"

export function MonthlyTable({
  monthlyData,
  summary,
}: {
  monthlyData: MonthlyRecord[]
  summary: Summary
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-card-foreground">Monthly Compliance Log</h2>
        <p className="text-sm text-muted-foreground">Fiscal year Apr 2025 – Mar 2026 (best-case scenario)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2 font-medium">Period</th>
              <th className="px-3 py-2 text-right font-medium">Directives Audited</th>
              <th className="px-3 py-2 text-right font-medium">Events</th>
              <th className="px-3 py-2 text-right font-medium">Damage Points</th>
              <th className="px-3 py-2 text-right font-medium">Cumulative</th>
              <th className="px-3 py-2 text-center font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((r) => (
              <tr key={r.period} className="border-b border-border/60 last:border-0">
                <td className="px-3 py-2.5 font-medium text-card-foreground">{r.period}</td>
                <td className="px-3 py-2.5 text-right text-muted-foreground">{r.directivesAudited}</td>
                <td className="px-3 py-2.5 text-right text-card-foreground">{r.events}</td>
                <td className="px-3 py-2.5 text-right text-card-foreground">{r.damagePoints}</td>
                <td className="px-3 py-2.5 text-right text-muted-foreground">{r.cumulativeDamagePoints}</td>
                <td className="px-3 py-2.5 text-center">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border font-semibold text-card-foreground">
              <td className="px-3 py-2.5">Total</td>
              <td className="px-3 py-2.5 text-right">{summary.totalDirectivesAudited}</td>
              <td className="px-3 py-2.5 text-right">{summary.totalEvents}</td>
              <td className="px-3 py-2.5 text-right">{summary.totalDamagePoints}</td>
              <td className="px-3 py-2.5 text-right">{summary.totalDamagePoints}</td>
              <td className="px-3 py-2.5 text-center">
                <StatusBadge status={summary.totalEvents === 0 ? "Target Met" : "Fail"} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: "Target Met" | "Fail" }) {
  const isMet = status === "Target Met"
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isMet ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
      }`}
    >
      {status}
    </span>
  )
}
