import { KpiSpecTable, type KpiSpecRow } from "@/components/portal/kpi-chrome"

const ROWS: KpiSpecRow[] = [
  {
    label: "Calculation",
    cells: [
      {
        colSpan: 6,
        content:
          "Each month the Contractor will provide an HIAA report indicating the staffing % for the Pass Control Office during the previous month. The report will also provide a detailed monthly schedule. The % of shift fill rate will determine the damage / advantage point. Shifts considered filled must be more than 1/2 the shift covered.",
      },
    ],
  },
  {
    label: "Threshold",
    cells: [
      { content: "Fail", tone: "danger" },
      { content: "75% or lower", align: "center" },
      { content: "Target", tone: "warning" },
      { content: "75% - 90%", align: "center" },
      { content: "Success", tone: "success" },
      { content: "91%", align: "center" },
    ],
  },
  {
    label: "Damage points",
    cells: [
      {
        colSpan: 2,
        content: (
          <div className="space-y-0.5">
            <p>100 per event below 50%</p>
            <p>75 per event 51% - 60%</p>
            <p>50 per event 61% - 75%</p>
          </div>
        ),
      },
      { colSpan: 2, content: "Advantage Points", tone: "success" },
      { colSpan: 2, content: "100 per event 91% - 100%", align: "center" },
    ],
  },
]

export function KpiSpec() {
  return <KpiSpecTable code="KPI-21" title="Pass Control Staffing" rows={ROWS} />
}
