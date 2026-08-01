import type { Metadata } from "next"
import { KPIS } from "@/lib/kpi-registry"
import { DASHBOARDS } from "@/components/portal/dashboard-map"
import { ReportsView, type ReportSection } from "@/components/portal/reports-view"

export const metadata: Metadata = {
  title: "KPI Reports | CNS HIAA Airport KPI Dashboard",
  description: "Generate and download printable CNS HIAA airport KPI reports.",
}

// Match the per-KPI pages: refresh the consolidated report from live data at
// most every 5 minutes.
export const revalidate = 300

export default function ReportsPage() {
  const sections: ReportSection[] = KPIS.filter((k) => k.available).map((k) => {
    const Dashboard = DASHBOARDS[k.id]
    return {
      id: k.id,
      label: k.label,
      title: k.title,
      node: Dashboard ? <Dashboard /> : null,
    }
  })

  return <ReportsView sections={sections} />
}
