import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { type Incident, type IncidentStatus } from "@/lib/kpi-12/kpi-data"

const statusStyles: Record<IncidentStatus, string> = {
  Resolved: "bg-accent/15 text-accent border-accent/30",
  "In Review": "bg-chart-4/15 text-chart-4 border-chart-4/30",
  Open: "bg-destructive/10 text-destructive border-destructive/30",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })
}

export function IncidentTable({ incidents }: { incidents: Incident[] }) {
  const sorted = [...incidents].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">Incident Log</CardTitle>
        <CardDescription>
          Every logged non-compliance event. Each row counts as one (1) event and 10 damage points.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="pl-6">ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="pr-6 text-right">Damage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((incident) => (
                <TableRow key={incident.id} className="border-border">
                  <TableCell className="pl-6 font-mono text-xs font-medium text-foreground">{incident.id}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(incident.date)}</TableCell>
                  <TableCell className="whitespace-nowrap font-medium text-foreground">{incident.category}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{incident.channel}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{incident.location}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <span className="block max-w-[22rem] truncate" title={incident.description}>
                      {incident.description}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={statusStyles[incident.status]}>
                      {incident.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right font-semibold text-destructive">
                    {incident.damagePoints}
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
