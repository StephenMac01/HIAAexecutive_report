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
import type { KpiEvent } from "@/lib/kpi-05/kpi-types"

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

export function EventLogTable({
  events,
  damagePerEvent,
}: {
  events: KpiEvent[]
  damagePerEvent: number
}) {
  const rows = [...events].sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Event log</CardTitle>
        <CardDescription>Every counted event in the reporting window</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Personnel</TableHead>
                <TableHead>Post</TableHead>
                <TableHead className="text-right">Damage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium text-foreground">{e.id}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {dateFmt.format(new Date(e.date))}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="gap-1.5 whitespace-nowrap"
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{
                          backgroundColor:
                            e.type === "Untrained working" ? "var(--chart-1)" : "var(--chart-4)",
                        }}
                        aria-hidden="true"
                      />
                      {e.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{e.unit}</TableCell>
                  <TableCell className="text-muted-foreground">{e.personnel}</TableCell>
                  <TableCell className="text-muted-foreground">{e.post}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums text-destructive">
                    &minus;{damagePerEvent}
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
