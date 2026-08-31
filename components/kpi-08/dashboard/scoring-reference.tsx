import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const damage = [
  { range: "0–39%", points: 20 },
  { range: "40–59%", points: 15 },
  { range: "60–79%", points: 10 },
]

const advantage = [
  { range: "91–95%", points: 15 },
  { range: "96–100%", points: 20 },
]

function Row({ range, points, kind }: { range: string; points: number; kind: "damage" | "advantage" }) {
  const damaging = kind === "damage"
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
      <span className="text-sm text-muted-foreground">{range}</span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
          damaging ? "bg-destructive/15 text-destructive" : "bg-chart-4/15 text-chart-4",
        )}
      >
        {damaging ? "−" : "+"}
        {points}/event
      </span>
    </div>
  )
}

export function ScoringReference() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Threshold &amp; Scoring</CardTitle>
        <CardDescription>How KPI-08 patrol compliance is rated</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-chart-5/10 p-3">
            <div className="text-xs font-medium text-chart-5">Fail</div>
            <div className="mt-0.5 text-sm font-semibold text-card-foreground">≤ 79%</div>
          </div>
          <div className="rounded-lg bg-chart-3/10 p-3">
            <div className="text-xs font-medium text-chart-3">Target</div>
            <div className="mt-0.5 text-sm font-semibold text-card-foreground">80–90%</div>
          </div>
          <div className="rounded-lg bg-chart-4/10 p-3">
            <div className="text-xs font-medium text-chart-4">Success</div>
            <div className="mt-0.5 text-sm font-semibold text-card-foreground">≥ 91%</div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Damage points</span>
          {damage.map((d) => (
            <Row key={d.range} {...d} kind="damage" />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Advantage points</span>
          {advantage.map((d) => (
            <Row key={d.range} {...d} kind="advantage" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
