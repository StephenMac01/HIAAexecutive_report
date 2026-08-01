import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getBand, getPoints, type Band, type SiteRecord } from "@/lib/kpi-08/kpi-data"
import { cn } from "@/lib/utils"

const bandStyles: Record<Band, string> = {
  Fail: "border-chart-5/40 text-chart-5",
  Target: "border-chart-3/40 text-chart-3",
  Success: "border-chart-4/40 text-chart-4",
}

export function SiteTable({ siteRecords }: { siteRecords: SiteRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance by Site</CardTitle>
        <CardDescription>Patrol completion, threshold band, and KPI points per location</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site</TableHead>
                <TableHead className="text-right">Scheduled</TableHead>
                <TableHead className="text-right">Completed</TableHead>
                <TableHead className="w-[180px]">Completion Rate</TableHead>
                <TableHead>Band</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {siteRecords.map((s) => {
                const band = getBand(s.rate)
                const points = getPoints(s.rate)
                return (
                  <TableRow key={s.site}>
                    <TableCell className="font-medium text-card-foreground">{s.site}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                      {s.scheduled}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                      {s.completed}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              band === "Fail" ? "bg-chart-5" : band === "Target" ? "bg-chart-3" : "bg-chart-4",
                            )}
                            style={{ width: `${s.rate}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-sm font-medium tabular-nums text-card-foreground">
                          {s.rate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("font-medium", bandStyles[band])}>
                        {band}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right text-sm font-semibold tabular-nums",
                        points > 0 ? "text-chart-4" : points < 0 ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {points > 0 ? `+${points}` : points}
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
