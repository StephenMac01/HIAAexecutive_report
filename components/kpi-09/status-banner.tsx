import { type TimelinessData } from "@/lib/kpi-09/kpi-data"
import { cn } from "@/lib/utils"
import { CircleAlert, CircleCheck } from "lucide-react"

export function StatusBanner({ period }: { period: TimelinessData["period"] }) {
  const { status, events, damagePoints } = period
  const isFail = status === "Fail"

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between",
        isFail
          ? "border-destructive/30 bg-destructive/5"
          : "border-chart-5/30 bg-chart-5/5",
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn(isFail ? "text-destructive" : "text-chart-5")}>
          {isFail ? <CircleAlert className="size-6" /> : <CircleCheck className="size-6" />}
        </span>
        <div>
          <p className="text-sm text-muted-foreground">Current period threshold</p>
          <p className="text-lg font-semibold text-foreground">
            {isFail ? "Fail" : "Meeting Target"} — {events} event{events === 1 ? "" : "s"} recorded
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <ThresholdPill label="Fail" value="1" active={isFail} tone="danger" />
        <ThresholdPill label="Target" value="0" active={!isFail} tone="success" />
        <ThresholdPill label="Success" value="n/a" active={false} tone="muted" />
        <div className="hidden text-right sm:block">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Damage pts</p>
          <p className={cn("text-2xl font-bold", isFail ? "text-destructive" : "text-chart-5")}>
            {damagePoints}
          </p>
        </div>
      </div>
    </div>
  )
}

function ThresholdPill({
  label,
  value,
  active,
  tone,
}: {
  label: string
  value: string
  active: boolean
  tone: "danger" | "success" | "muted"
}) {
  const toneRing = {
    danger: "ring-destructive text-destructive",
    success: "ring-chart-5 text-chart-5",
    muted: "ring-border text-muted-foreground",
  }
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div
        className={cn(
          "mt-1 flex size-9 items-center justify-center rounded-full text-sm font-semibold ring-1",
          toneRing[tone],
          active && "ring-2",
        )}
      >
        {value}
      </div>
    </div>
  )
}
