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
import type { ComplimentEvent } from "@/lib/kpi-02/kpi-data"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function ComplimentEventsTable({ events }: { events: ComplimentEvent[] }) {
  const rows = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliment event log</CardTitle>
        <CardDescription>
          Raw events as recorded in the workbook. Solicited compliments are flagged and excluded from the count.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-[420px] overflow-auto rounded-md border border-border">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead className="w-24">Ref</TableHead>
                <TableHead className="w-28">Date</TableHead>
                <TableHead className="w-44">Source</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead className="w-28 text-right">Counted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((ev) => (
                <TableRow key={ev.id} className={ev.solicited ? "opacity-60" : undefined}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{ev.id}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm tabular-nums">
                    {formatDate(ev.date)}
                  </TableCell>
                  <TableCell className="text-sm">{ev.source}</TableCell>
                  <TableCell className="text-sm text-muted-foreground text-pretty">
                    {ev.summary}
                  </TableCell>
                  <TableCell className="text-right">
                    {ev.solicited ? (
                      <Badge variant="outline" className="border-border text-muted-foreground">
                        Excluded
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                        +1
                      </Badge>
                    )}
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
