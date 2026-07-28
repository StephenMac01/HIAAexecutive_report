import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import type { getEventsByTeamLead } from "@/lib/kpi-13/kpi-data"

type LeadDatum = ReturnType<typeof getEventsByTeamLead>[number]

export function TeamLeadBreakdown({ data }: { data: LeadDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.events))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events by Team Lead</CardTitle>
        <CardDescription>Accountability for briefing failures</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {data.map((d) => (
            <li key={d.teamLead} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{d.teamLead}</span>
                <span className={d.events > 0 ? "text-destructive font-semibold" : "text-muted-foreground"}>
                  {d.events} {d.events === 1 ? "event" : "events"}
                  {d.damagePoints > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({d.damagePoints} dmg)
                    </span>
                  )}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${d.events > 0 ? "bg-destructive" : "bg-chart-2"}`}
                  style={{ width: `${(d.events / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
