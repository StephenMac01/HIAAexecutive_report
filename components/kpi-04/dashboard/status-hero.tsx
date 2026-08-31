import { CheckCircle2, XCircle, Target, AlertTriangle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { KPI } from "@/lib/kpi-04/kpi-data"
import { cn } from "@/lib/utils"

type StatusHeroProps = {
  periodLabel: string
  eventCount: number
  damagePoints: number
  pass: boolean
}

export function StatusHero({
  periodLabel,
  eventCount: currentEventCount,
  damagePoints: currentDamagePoints,
  pass,
}: StatusHeroProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-l-4 p-6",
        pass ? "border-l-[var(--success)]" : "border-l-destructive",
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-full",
              pass
                ? "bg-[var(--success)]/12 text-[var(--success)]"
                : "bg-destructive/12 text-destructive",
            )}
          >
            {pass ? (
              <CheckCircle2 className="size-8" aria-hidden="true" />
            ) : (
              <XCircle className="size-8" aria-hidden="true" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {periodLabel} · Current Status
            </p>
            <p
              className={cn(
                "text-3xl font-bold",
                pass ? "text-[var(--success)]" : "text-destructive",
              )}
            >
              {pass ? "PASS" : "FAIL"}
            </p>
            <p className="mt-1 max-w-md text-pretty text-sm text-muted-foreground">
              {pass
                ? "No unreported absent posts this period. Meeting the target of zero events."
                : `${currentEventCount} unreported absent post${
                    currentEventCount === 1 ? "" : "s"
                  } recorded. Target is zero — any event is a breach.`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border text-center">
          <ThresholdCell
            icon={<Target className="size-4" />}
            label="Target"
            value={KPI.threshold.target}
            tone="muted"
          />
          <ThresholdCell
            icon={<AlertTriangle className="size-4" />}
            label="Fail at"
            value={`≥ ${KPI.threshold.fail}`}
            tone="muted"
          />
          <ThresholdCell
            label="Events"
            value={currentEventCount}
            tone={pass ? "success" : "danger"}
            emphasize
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-4 text-sm">
        <span className="text-muted-foreground">
          Damage points this period:{" "}
          <span
            className={cn(
              "font-semibold",
              currentDamagePoints > 0 ? "text-destructive" : "text-foreground",
            )}
          >
            {currentDamagePoints}
          </span>
        </span>
        <span className="text-muted-foreground">
          Rate:{" "}
          <span className="font-mono font-medium text-foreground">
            {KPI.damagePointsPerEvent} pts / event
          </span>
        </span>
        <span className="text-muted-foreground">
          Advantage points: <span className="font-medium text-foreground">n/a</span>
        </span>
      </div>
    </Card>
  )
}

function ThresholdCell({
  icon,
  label,
  value,
  tone,
  emphasize,
}: {
  icon?: React.ReactNode
  label: string
  value: string | number
  tone: "muted" | "success" | "danger"
  emphasize?: boolean
}) {
  return (
    <div className="min-w-20 bg-card px-4 py-3">
      <div className="flex items-center justify-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p
        className={cn(
          "mt-1 font-bold tabular-nums",
          emphasize ? "text-3xl" : "text-2xl",
          tone === "success" && "text-[var(--success)]",
          tone === "danger" && "text-destructive",
          tone === "muted" && "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  )
}
