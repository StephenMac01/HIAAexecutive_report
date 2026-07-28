import { ClipboardList } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { VehicleEvent } from "@/lib/kpi-15/kpi-data"

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "2-digit" })
}

export function EventsTable({ events }: { events: VehicleEvent[] }) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-4 text-muted-foreground" aria-hidden="true" />
          <CardTitle className="text-sm font-semibold">Event log</CardTitle>
        </div>
        <span className="text-xs text-muted-foreground">{events.length} events · 10 pts each</span>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Week ending</TableHead>
                <TableHead>Incident date</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Event type</TableHead>
                <TableHead className="min-w-64">Description</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-5 text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((e) => (
                <TableRow key={e.eventId}>
                  <TableCell className="whitespace-nowrap pl-5 font-mono text-xs font-medium">
                    {formatDate(e.weekEnding)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                    {formatDate(e.date)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs font-medium">{e.vehicleId}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="flex items-center gap-1.5 text-sm">
                      <span
                        className="size-2 rounded-full"
                        style={{
                          backgroundColor:
                            e.eventType === "Missing Requirement" ? "var(--chart-1)" : "var(--chart-3)",
                        }}
                      />
                      {e.eventType}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground text-pretty">{e.description}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{e.location}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        e.status === "Open"
                          ? "border-destructive/40 bg-destructive/10 text-destructive"
                          : "border-chart-4/40 bg-chart-4/10 text-chart-4"
                      }
                    >
                      {e.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-5 text-right font-mono text-sm font-semibold text-destructive">
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
