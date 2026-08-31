import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Incident } from "@/lib/kpi-16/kpi-data"

export function IncidentTable({ incidents }: { incidents: Incident[] }) {
  const rows = [...incidents].sort((a, b) => b.weekNumber - a.weekNumber)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Weekly Incident Log</CardTitle>
        <CardDescription>
          Every dashboard metric is derived from these rows. The data owner appends one row per response each week —
          Target, Status, Event and Damage Points are calculated automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">Wk</TableHead>
                <TableHead>Week Ending</TableHead>
                <TableHead>Incident</TableHead>
                <TableHead>Date / Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Target</TableHead>
                <TableHead className="text-right">Response</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Event</TableHead>
                <TableHead className="text-right">Damage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((inc) => {
                const isBreach = inc.status === "Breach"
                return (
                  <TableRow key={inc.id}>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{inc.weekNumber}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{inc.weekEnding}</TableCell>
                    <TableCell className="font-mono text-xs">{inc.id}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {inc.date}
                      <span className="ml-1 text-xs opacity-70">{inc.time}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{inc.location}</TableCell>
                    <TableCell>
                      <Badge variant={inc.type === "Emergency" ? "default" : "secondary"}>{inc.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {inc.targetMinutes}m
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium tabular-nums ${isBreach ? "text-destructive" : ""}`}
                    >
                      {inc.responseMinutes.toFixed(1)}m
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          isBreach
                            ? "border-destructive/30 bg-destructive/10 text-destructive"
                            : "border-[var(--chart-2)]/30 bg-[var(--chart-2)]/10 text-[var(--chart-2)]"
                        }
                      >
                        {inc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{inc.event}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {inc.damagePoints > 0 ? (
                        <span className="font-semibold text-destructive">{inc.damagePoints}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
