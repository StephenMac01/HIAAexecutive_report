import { FileStack, ShieldAlert, ShieldCheck, Gavel } from "lucide-react"
import { KpiStatCard, KpiStatGrid } from "@/components/portal/kpi-chrome"
import type { Kpi01Summary } from "@/lib/kpi-01/kpi-data"

export function SummaryCards({ summary }: { summary: Kpi01Summary }) {
  const stats = [
    {
      label: "Total Records",
      value: summary.totalRecords,
      hint: "All reported events reviewed",
      Icon: FileStack,
    },
    {
      label: "Counted Events",
      value: summary.counted,
      hint: "Substantiated & included",
      Icon: ShieldAlert,
    },
    {
      label: "Excluded / Not Substantiated",
      value: summary.excluded,
      hint: "Did not meet counting criteria",
      Icon: ShieldCheck,
    },
    {
      label: "Damage Points",
      value: summary.totalDamagePoints,
      hint: "2 points per counted event",
      Icon: Gavel,
    },
  ]

  return (
    <KpiStatGrid columns={4}>
      {stats.map(({ label, value, hint, Icon }) => (
        <KpiStatCard key={label} label={label} value={value} hint={hint} icon={<Icon className="size-5" />} />
      ))}
    </KpiStatGrid>
  )
}
