import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { SafetyEvent } from "@/lib/kpi-17/kpi"

function severityTone(severity: SafetyEvent["severity"]) {
  return {
    High: "border-destructive/40 bg-destructive/10 text-destructive",
    Medium: "border-chart-3/40 bg-chart-3/10 text-chart-3",
    Low: "border-chart-2/40 bg-chart-2/10 text-chart-2",
  }[severity]
}

export function EventsTable({ events }: { events: SafetyEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Non-Adherence Event Log</CardTitle>
        <CardDescription>
          {events.length} recorded events · each event = 25 damage points
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Event ID</TableHead>
                <TableHead className="hidden md:table-cell">Week</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Safety Element</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Damage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.id}</TableCell>
                  <TableCell className="hidden whitespace-nowrap font-mono text-xs text-muted-foreground md:table-cell">
                    {e.week}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{e.date}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{e.element}</span>
                      <span className="hidden text-xs text-muted-foreground sm:block">
                        {e.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {e.location}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(severityTone(e.severity))}>
                      {e.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-sm",
                        e.status === "Open" ? "text-accent" : "text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          e.status === "Open" ? "bg-accent" : "bg-chart-5",
                        )}
                        aria-hidden="true"
                      />
                      {e.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-destructive">
                    {e.damagePoints}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
