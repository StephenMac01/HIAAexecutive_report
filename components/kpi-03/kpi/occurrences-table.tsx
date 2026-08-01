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
import type { Occurrence } from "@/lib/kpi-03/kpi-data"

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

export function OccurrencesTable({ occurrences }: { occurrences: Occurrence[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Occurrence Log</CardTitle>
        <CardDescription>
          Every recorded instance of staffing below the minimum — each counts as one (1).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Post</TableHead>
                <TableHead className="text-center">Req.</TableHead>
                <TableHead className="text-center">Actual</TableHead>
                <TableHead className="text-center">Shortfall</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Damage pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {occurrences.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{o.id}</TableCell>
                  <TableCell className="whitespace-nowrap">{dateFmt.format(new Date(o.date))}</TableCell>
                  <TableCell className="whitespace-nowrap">{o.shift}</TableCell>
                  <TableCell>{o.post}</TableCell>
                  <TableCell className="text-center tabular-nums">{o.required}</TableCell>
                  <TableCell className="text-center tabular-nums">{o.actual}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="border-destructive/40 text-destructive tabular-nums">
                      -{o.required - o.actual}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{o.duration}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{o.damagePoints}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
