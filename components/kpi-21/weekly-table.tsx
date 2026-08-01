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
import { statusFor, type WeeklyStaffingRow } from "@/lib/kpi-21/kpi"

function fillRate(row: WeeklyStaffingRow): number {
  if (row.shiftsScheduled <= 0) return 0
  return Math.round((row.shiftsFilled / row.shiftsScheduled) * 1000) / 10
}

export function WeeklyTable({ weeks }: { weeks: WeeklyStaffingRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Entries</CardTitle>
        <CardDescription>
          The raw weekly HIAA reports that feed the dashboard. Add one row per week in the Excel template
          using these exact columns; the monthly figures above update automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Week Ending</TableHead>
                <TableHead>Office</TableHead>
                <TableHead className="text-right">Scheduled</TableHead>
                <TableHead className="text-right">Filled</TableHead>
                <TableHead className="text-right">Fill rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeks.map((w) => {
                const rate = fillRate(w)
                return (
                  <TableRow key={`${w.weekEnding}-${w.office}`}>
                    <TableCell className="font-medium tabular-nums text-foreground">
                      {w.weekEnding}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{w.office}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {w.shiftsScheduled}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {w.shiftsFilled}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-foreground">
                      {rate}%
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={statusFor(rate)} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{w.reportedBy || "—"}</TableCell>
                    <TableCell className="max-w-56 truncate text-muted-foreground" title={w.notes}>
                      {w.notes || "—"}
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
