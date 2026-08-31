import { Car } from "lucide-react"
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
import type { FleetVehicle } from "@/lib/kpi-15/kpi-data"

function statusClass(status: FleetVehicle["status"]) {
  switch (status) {
    case "Compliant":
      return "border-chart-4/40 bg-chart-4/10 text-chart-4"
    case "Non-Compliant":
      return "border-destructive/40 bg-destructive/10 text-destructive"
    default:
      return "border-chart-3/40 bg-chart-3/10 text-chart-3"
  }
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "2-digit" })
}

export function FleetTable({ fleet }: { fleet: FleetVehicle[] }) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Car className="size-4 text-muted-foreground" aria-hidden="true" />
          <CardTitle className="text-sm font-semibold">Fleet roster</CardTitle>
        </div>
        <span className="text-xs text-muted-foreground">{fleet.length} vehicles</span>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Vehicle ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Make / Model</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Last inspection</TableHead>
                <TableHead className="pr-5 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fleet.map((v) => (
                <TableRow key={v.vehicleId}>
                  <TableCell className="pl-5 font-mono text-xs font-medium">{v.vehicleId}</TableCell>
                  <TableCell className="text-sm">{v.type}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{v.makeModel}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{v.year}</TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                    {formatDate(v.lastInspection)}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <Badge variant="outline" className={statusClass(v.status)}>
                      {v.status}
                    </Badge>
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
