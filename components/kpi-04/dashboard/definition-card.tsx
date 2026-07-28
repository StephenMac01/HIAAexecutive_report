import { Clock, FileWarning } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function DefinitionCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How an Event Is Counted</CardTitle>
        <CardDescription>
          Each of the following counts as one (1) event · 10 damage points.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 rounded-md border border-border bg-muted/40 p-3">
          <Clock className="mt-0.5 size-5 shrink-0 text-[var(--chart-3)]" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            A staff no-show <span className="font-medium text-foreground">not reported to
            HIAA within 5 minutes</span> of a confirmed no-show for an assigned shift.
          </p>
        </div>
        <div className="flex gap-3 rounded-md border border-border bg-muted/40 p-3">
          <FileWarning
            className="mt-0.5 size-5 shrink-0 text-[var(--chart-4)]"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">
            A known shortage without{" "}
            <span className="font-medium text-foreground">written notice ≥ 24 hours in
            advance</span>, specifying the shift and number of missing staff. A general
            schedule is not acceptable notification.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
