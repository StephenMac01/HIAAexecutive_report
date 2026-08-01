import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/kpi-21/status-badge"
import type { StaffingRecord } from "@/lib/kpi-21/kpi"

function pointsCell(value: number) {
  if (value === 0) return <span className="text-muted-foreground">0</span>
  const tone = value > 0 ? "text-success" : "text-destructive"
  return (
    <span className={`font-medium tabular-nums ${tone}`}>
      {value > 0 ? "+" : ""}
      {value}
    </span>
  )
}

export function MonthlyTable({ records }: { records: StaffingRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Detail</CardTitle>
        <CardDescription>Weekly reports rolled up into monthly staffing figures and points.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Weeks</TableHead>
                <TableHead className="text-right">Scheduled</TableHead>
                <TableHead className="text-right">Filled</TableHead>
                <TableHead className="text-right">Fill rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Damage</TableHead>
                <TableHead className="text-right">Advantage</TableHead>
                <TableHead className="text-right">Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.month}>
                  <TableCell className="font-medium text-foreground">{r.label}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {r.weeks ?? "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {r.shiftsScheduled}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {r.shiftsFilled}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-foreground">
                    {r.fillRate}%
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.damagePoints ? (
                      <span className="text-destructive">-{r.damagePoints}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.advantagePoints ? (
                      <span className="text-success">+{r.advantagePoints}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{pointsCell(r.netPoints)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
