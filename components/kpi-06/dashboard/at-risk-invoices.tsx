import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { riskLevel, type OpenInvoice } from "@/lib/kpi-06/kpi-data"
import { cn } from "@/lib/utils"

const riskStyles: Record<string, string> = {
  critical: "border-transparent bg-destructive text-white",
  warning: "border-transparent bg-chart-4 text-primary-foreground",
  ok: "border-transparent bg-chart-1 text-primary-foreground",
}

const riskLabel: Record<string, string> = {
  critical: "Critical",
  warning: "Watch",
  ok: "On track",
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

export function AtRiskInvoices({ openInvoices }: { openInvoices: OpenInvoice[] }) {
  const sorted = [...openInvoices].sort((a, b) => b.daysOpen - a.daysOpen)
  const criticalCount = sorted.filter((i) => riskLevel(i.daysOpen) === "critical").length

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle>Open Incorrect Invoices — 30-Day Rectification Window</CardTitle>
            <CardDescription>
              Flagged invoices become an event if not rectified within 30 days. Prioritize before the deadline.
            </CardDescription>
          </div>
          <Badge className={cn(criticalCount > 0 ? riskStyles.critical : riskStyles.ok)}>
            {criticalCount} approaching deadline
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead className="hidden md:table-cell">Issue</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[180px]">Time to deadline</TableHead>
              <TableHead className="text-right">Risk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((inv) => {
              const level = riskLevel(inv.daysOpen)
              const remaining = 30 - inv.daysOpen
              const pct = Math.min(100, (inv.daysOpen / 30) * 100)
              return (
                <TableRow key={inv.id}>
                  <TableCell>
                    <div className="font-mono text-sm font-medium">{inv.id}</div>
                    <div className="text-xs text-muted-foreground">{inv.vendor}</div>
                    <div className="text-xs text-muted-foreground">Submitted {inv.submitted}</div>
                  </TableCell>
                  <TableCell className="hidden max-w-[220px] text-sm text-muted-foreground md:table-cell text-pretty">
                    {inv.issue}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">
                    {currency.format(inv.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Day {inv.daysOpen}/30</span>
                      <span
                        className={cn(
                          "font-medium",
                          level === "critical" ? "text-destructive" : "text-foreground",
                        )}
                      >
                        {remaining}d left
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      className={cn(
                        "mt-1.5 h-1.5",
                        level === "critical"
                          ? "[&>*]:bg-destructive"
                          : level === "warning"
                            ? "[&>*]:bg-chart-4"
                            : "[&>*]:bg-chart-1",
                      )}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={riskStyles[level]}>{riskLabel[level]}</Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
