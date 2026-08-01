import { KpiSpecTable, type KpiSpecRow } from "@/components/portal/kpi-chrome"
import { KPI_META } from "@/lib/kpi-03/kpi-data"

export function ScoringReference() {
  const rows: KpiSpecRow[] = [
    {
      label: "Threshold",
      cells: [
        { content: `Fail: ${KPI_META.threshold.fail}`, tone: "danger", align: "center" },
        { content: `Target: ${KPI_META.threshold.target}`, tone: "warning", align: "center" },
        { content: `Success: ${KPI_META.threshold.success}`, tone: "success", align: "center" },
      ],
    },
    {
      label: "Damage points",
      cells: [
        { content: `${KPI_META.damagePointsPerEvent} per event`, tone: "plain" },
        { content: "Advantage points: n/a", tone: "muted", colSpan: 2 },
      ],
    },
    {
      label: "Excusing Event",
      cells: [{ content: KPI_META.excusingEvent, colSpan: 3, tone: "plain" }],
    },
  ]

  return <KpiSpecTable code={KPI_META.id} title="Scoring & Threshold Definition" rows={rows} />
}
