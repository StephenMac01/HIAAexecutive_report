import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import type { BriefingEvent, EventStatus } from "@/lib/kpi-13/kpi-data"

const statusStyles: Record<EventStatus, string> = {
  "Missed Briefing": "bg-destructive/10 text-destructive",
  "Incomplete Info": "bg-accent text-accent-foreground",
  "Late Briefing": "bg-muted text-muted-foreground",
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function EventLog({ events: rawEvents }: { events: BriefingEvent[] }) {
  const events = [...rawEvents].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Log</CardTitle>
        <CardDescription>
          Each logged event counts as one (1) failure = 2 damage points
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Date</th>
                <th className="px-5 py-2.5 font-medium">Week</th>
                <th className="px-5 py-2.5 font-medium">Shift</th>
                <th className="px-5 py-2.5 font-medium">Team Lead</th>
                <th className="px-5 py-2.5 font-medium">Post</th>
                <th className="px-5 py-2.5 font-medium">Description</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 text-right font-medium">Dmg</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                  <td className="whitespace-nowrap px-5 py-3 font-medium">{formatDate(e.date)}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">{e.week}</td>
                  <td className="whitespace-nowrap px-5 py-3">{e.shift}</td>
                  <td className="whitespace-nowrap px-5 py-3">{e.teamLead}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">{e.post}</td>
                  <td className="min-w-64 px-5 py-3 text-muted-foreground">{e.description}</td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[e.status]}`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right font-semibold text-destructive">
                    {e.damagePoints}
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
