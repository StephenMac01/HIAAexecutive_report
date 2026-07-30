import type { Metadata } from "next";
import { KPIS } from "@/lib/kpi-registry";
import { DASHBOARDS } from "@/components/portal/dashboard-map";
import {
  ReportsView,
  type ReportSection,
} from "@/components/portal/reports-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "KPI Reports | CNS HIAA Airport KPI Dashboard",
  description: "Generate and download printable CNS HIAA airport KPI reports.",
};

export default function ReportsPage() {
  const sections: ReportSection[] = KPIS.filter((kpi) => kpi.available).map(
    (kpi) => {
      const Dashboard = DASHBOARDS[kpi.id];

      return {
        id: kpi.id,
        label: kpi.label,
        title: kpi.title,
        node: Dashboard ? <Dashboard /> : null,
      };
    },
  );

  return <ReportsView sections={sections} />;
}
