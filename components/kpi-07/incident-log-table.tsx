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
import type { Incident } from "@/lib/kpi-07/kpi-data"

const severityStyles: Record<Incident["severity"], string> = {
  Critical: "bg-destructive/15 text-destructive border-destructive/20",
  Major: "bg-chart-4/15 text-chart-4 border-chart-4/20",
  Minor: "bg-muted text-muted-foreground border-border",
}

const statusStyles: Record<Incident["status"], string> = {
  Confirmed: "bg-destructive/10 text-destructive",
  "Under Review": "bg-chart-4/10 text-chart-4",
  Disputed: "bg-muted text-muted-foreground",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export function IncidentLogTable({ incidentLog }: { incidentLog: Incident[] }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Incident Log</CardTitle>
        <CardDescription>
          Every recorded event contributing to the KPI-07 score, with severity and current review status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Damage Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidentLog.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-mono text-xs font-medium">{incident.id}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(incident.date)}
                  </TableCell>
                  <TableCell className="font-medium">{incident.category}</TableCell>
                  <TableCell className="text-muted-foreground">{incident.location}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={severityStyles[incident.severity]}>
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusStyles[incident.status]}>{incident.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-destructive">
                    +{incident.damagePoints}
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
