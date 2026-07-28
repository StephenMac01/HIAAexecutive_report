import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EVENT_TYPE_LABEL, type AbsentPostEvent } from "@/lib/kpi-04/kpi-data"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function EventLog({ events }: { events: AbsentPostEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Log — Most Recent</CardTitle>
        <CardDescription>
          Every recorded breach from the Excel sheet with the metric that triggered it.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Ref</TableHead>
                <TableHead className="whitespace-nowrap">Date</TableHead>
                <TableHead>Post</TableHead>
                <TableHead>Breach type</TableHead>
                <TableHead className="text-right whitespace-nowrap">Metric</TableHead>
                <TableHead className="text-right">Staff</TableHead>
                <TableHead className="text-right whitespace-nowrap">Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((e) => {
                const isLate = e.type === "no-show-late-report"
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {e.id}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDate(e.date)}
                      <span className="ml-1 text-xs text-muted-foreground">{e.time}</span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {e.post}
                      <span className="block text-xs text-muted-foreground">{e.zone}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          isLate
                            ? "border-[var(--chart-3)]/40 bg-[var(--chart-3)]/10 text-[var(--chart-3)]"
                            : "border-[var(--chart-4)]/40 bg-[var(--chart-4)]/10 text-[var(--chart-4)]"
                        }
                      >
                        {EVENT_TYPE_LABEL[e.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {isLate ? (
                        <span className="text-destructive">{e.reportMinutes}m</span>
                      ) : (
                        <span className="text-destructive">{e.noticeHours}h</span>
                      )}
                      <span className="ml-1 text-xs text-muted-foreground">
                        {isLate ? "/ 5m" : "/ 24h"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {e.missingStaff}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-destructive">
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
