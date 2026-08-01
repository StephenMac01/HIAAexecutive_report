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
import type { ShiftRow } from "@/lib/kpi-20/kpi"

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

type EventLogTableProps = {
  rows: ShiftRow[]
  minimumRequired: number
  damagePerEvent: number
}

export function EventLogTable({ rows, minimumRequired, damagePerEvent }: EventLogTableProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">Event log — shifts below minimum</CardTitle>
        <CardDescription>
          Every reported shift with fewer than {minimumRequired} D drivers. Each row is one event
          ({damagePerEvent} damage points).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-right">D drivers</TableHead>
                <TableHead className="text-right">Required</TableHead>
                <TableHead className="text-right">Damage points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{formatDate(r.date)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {r.shift}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.team}</TableCell>
                  <TableCell className="text-right font-mono text-destructive">{r.driversOnShift}</TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {r.minimumRequired}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">{r.damagePoints}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
