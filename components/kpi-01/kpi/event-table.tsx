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
import { formatDate, type KpiEvent } from "@/lib/kpi-01/kpi-data"
import { cn } from "@/lib/utils"

export function EventTable({ events }: { events: KpiEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Log</CardTitle>
        <CardDescription>
          Every reported event and how it was treated for KPI-01 scoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Event ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Incident Category</TableHead>
                <TableHead className="text-center">Substantiated</TableHead>
                <TableHead className="text-center">KPI Treatment</TableHead>
                <TableHead className="text-right">Damage Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((e) => {
                const counted = e.substantiated && e.treatment === "Included"
                return (
                  <TableRow key={e.id} className={cn(counted && "bg-destructive/5")}>
                    <TableCell className="font-mono text-xs font-medium">{e.id}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(e.date)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{e.source}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {e.location}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{e.category}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-medium",
                          e.substantiated
                            ? "border-destructive/30 bg-destructive/10 text-destructive"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        {e.substantiated ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-medium",
                          e.treatment === "Included"
                            ? "border-destructive/30 bg-destructive/10 text-destructive"
                            : "border-success/30 bg-success/10 text-success",
                        )}
                      >
                        {e.treatment}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {e.damagePoints}
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
