import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/kpi-18/badge"
import { type KpiEvent } from "@/lib/kpi-18/kpi"

function severityVariant(sev: string): "secondary" | "warning" | "destructive" {
  if (sev === "Critical" || sev === "High") return "destructive"
  if (sev === "Moderate") return "warning"
  return "secondary"
}

export function EventsTable({ events }: { events: KpiEvent[] }) {
  const rows = events

  return (
    <Card>
      <CardHeader>
        <CardTitle>Failure event log</CardTitle>
        <CardDescription>
          All {rows.length} recorded failures to report to the Duty Security Manager in 2025
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="max-h-[28rem] overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Event</th>
                <th className="px-4 py-2.5 font-medium">Week ending</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Team Lead</th>
                <th className="px-4 py-2.5 font-medium">Site</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Severity</th>
                <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Description</th>
                <th className="px-4 py-2.5 text-right font-medium">Pts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e: KpiEvent) => (
                <tr
                  key={e["Event ID"]}
                  className="border-b border-border/60 transition-colors hover:bg-muted/50"
                >
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                    {e["Event ID"]}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-muted-foreground">
                    {e["Week Ending"]}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 tabular-nums">{e.Date}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 font-medium">{e["Team Lead"]}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">{e.Site}</td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <Badge variant={e["Incident Type"] === "Security Incident" ? "default" : "secondary"}>
                      {e["Incident Type"].replace(" Incident", "")}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={severityVariant(e.Severity)}>{e.Severity}</Badge>
                  </td>
                  <td className="hidden max-w-xs px-4 py-2.5 text-muted-foreground lg:table-cell">
                    <span className="line-clamp-1">{e.Description}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-destructive">
                    {e["Damage Points"]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
