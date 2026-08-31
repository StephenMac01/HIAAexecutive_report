import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { DefaultBand } from "@/lib/executive-summary/types"

const BANDS: { band: DefaultBand; label: string; from: number; to: number; color: string }[] = [
  { band: "green", label: "Compliant", from: 0, to: 150, color: "var(--success)" },
  { band: "yellow", label: "Watch", from: 150, to: 300, color: "var(--warning)" },
  { band: "orange", label: "Elevated", from: 300, to: 400, color: "var(--orange)" },
  { band: "red", label: "Event of Default", from: 400, to: 500, color: "var(--destructive)" },
]

const BAND_COLOR: Record<DefaultBand, string> = {
  green: "var(--success)",
  yellow: "var(--warning)",
  orange: "var(--orange)",
  red: "var(--destructive)",
}

export function DefaultGauge({
  value,
  threshold,
  band,
}: {
  value: number
  threshold: number
  band: DefaultBand
}) {
  const max = 500
  const pct = Math.min(100, (value / max) * 100)
  const thresholdPct = (threshold / max) * 100

  return (
    <Card className="border-navy/10">
      <CardHeader>
        <CardTitle className="text-base text-navy">Rolling 6-Month Default Meter</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-4xl font-bold tabular-nums text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">of {max} damage points</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold" style={{ color: BAND_COLOR[band] }}>
              {BANDS.find((b) => b.band === band)?.label}
            </div>
            <div className="text-xs text-muted-foreground">Default at {threshold}</div>
          </div>
        </div>

        {/* Band track */}
        <div className="relative">
          <div className="flex h-4 w-full overflow-hidden rounded-full">
            {BANDS.map((b) => (
              <div
                key={b.band}
                style={{ width: `${((b.to - b.from) / max) * 100}%`, backgroundColor: b.color, opacity: 0.25 }}
                aria-hidden
              />
            ))}
          </div>
          {/* Fill */}
          <div
            className="absolute left-0 top-0 h-4 rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: BAND_COLOR[band] }}
            aria-hidden
          />
          {/* Threshold marker */}
          <div
            className="absolute -top-1 h-6 w-0.5 bg-foreground"
            style={{ left: `${thresholdPct}%` }}
            aria-hidden
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {BANDS.map((b) => (
            <div key={b.band} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ backgroundColor: b.color }} aria-hidden />
              <span className={cn("text-[11px]", b.band === band ? "font-semibold text-foreground" : "text-muted-foreground")}>
                {b.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
