import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { KpiSpecTable, type KpiSpecRow } from "@/components/portal/kpi-chrome"
import { KPI02, type Kpi02Summary } from "@/lib/kpi-02/kpi-data"

export function Kpi02SpecCard({ summary }: { summary: Kpi02Summary }) {
  const pointsPct = (summary.bestMonth.advantagePoints / KPI02.advantagePointsMax) * 100

  const rows: KpiSpecRow[] = [
    {
      label: "Calculation",
      cells: [
        {
          content:
            "Each customer compliment received is counted as one (1) event. Compliments arrive via several sources (reception, website, Information Booth, stakeholders, Airport Operations Centre, social media, etc.). Compliments solicited by the Contractor are not counted.",
          colSpan: 3,
          tone: "plain",
        },
      ],
    },
    {
      label: "Threshold",
      cells: [
        { content: "Fail: n/a", tone: "muted", align: "center" },
        { content: `Target: ${KPI02.target}`, tone: "warning", align: "center" },
        { content: `Success: ${KPI02.success}`, tone: "success", align: "center" },
      ],
    },
    {
      label: "Damage points",
      cells: [{ content: "n/a", colSpan: 3, tone: "muted" }],
    },
    {
      label: "Advantage points",
      cells: [
        {
          content: `1 advantage point per event after receipt of ${KPI02.advantageFreeThreshold} compliments, up to a maximum of ${KPI02.advantagePointsMax} advantage points.`,
          colSpan: 3,
          tone: "plain",
        },
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <KpiSpecTable code={KPI02.code} title={KPI02.name} rows={rows} />

      <Card>
        <CardContent className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">
              Best period advantage points ({summary.bestMonth.month})
            </span>
            <span className="tabular-nums text-muted-foreground">
              {summary.bestMonth.advantagePoints} / {KPI02.advantagePointsMax}
            </span>
          </div>
          <Progress value={pointsPct} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {summary.bestMonth.counted} compliments counted in {summary.bestMonth.month} — first{" "}
            {KPI02.advantageFreeThreshold} earn no points, remainder capped at {KPI02.advantagePointsMax}.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
