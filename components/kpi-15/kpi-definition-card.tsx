import { ClipboardList } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function KpiDefinitionCard() {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-row items-center gap-2 border-b border-border px-5 py-4">
        <ClipboardList className="size-4 text-muted-foreground" aria-hidden="true" />
        <CardTitle className="text-sm font-semibold">KPI definition &amp; scoring</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Vehicles provided by the Contractor are to be kept visually of high standard, maintained in good condition
            and repair, equipped as required by HIAA and the HIAA Traffic Directives, and compliant with Nova Scotia
            Department of Justice regulations.
          </p>
          <p>
            A vehicle identified to be missing the requirements will count as one <strong className="text-foreground">(1) event</strong>.
            A vehicle removed from site without being replaced will count as one <strong className="text-foreground">(1) event</strong>.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-border bg-border text-center">
          <div className="bg-card p-3">
            <p className="text-xs font-medium text-muted-foreground">Fail</p>
            <p className="mt-1 font-mono text-lg font-semibold text-destructive">1</p>
          </div>
          <div className="bg-card p-3">
            <p className="text-xs font-medium text-muted-foreground">Target</p>
            <p className="mt-1 font-mono text-lg font-semibold text-chart-4">0</p>
          </div>
          <div className="bg-card p-3">
            <p className="text-xs font-medium text-muted-foreground">Success</p>
            <p className="mt-1 font-mono text-lg font-semibold text-foreground">n/a</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border text-center">
          <div className="bg-card p-3">
            <p className="text-xs font-medium text-muted-foreground">Damage points</p>
            <p className="mt-1 font-mono text-lg font-semibold text-foreground">10 / event</p>
          </div>
          <div className="bg-card p-3">
            <p className="text-xs font-medium text-muted-foreground">Advantage points</p>
            <p className="mt-1 font-mono text-lg font-semibold text-foreground">n/a</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
