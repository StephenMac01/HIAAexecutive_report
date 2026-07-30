import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Construction } from "lucide-react";
import { KPIS, getKpi } from "@/lib/kpi-registry";
import { DASHBOARDS } from "@/components/portal/dashboard-map";
import { PortalShell } from "@/components/portal/portal-shell";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const kpi = getKpi(id);

  return {
    title: kpi
      ? `${kpi.label} | CNS HIAA Airport KPI Dashboard`
      : "CNS HIAA Airport KPI Dashboard",
  };
}

export default async function KpiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kpi = getKpi(id);

  if (!kpi) {
    notFound();
  }

  const Dashboard = DASHBOARDS[kpi.id];

  return (
    <PortalShell title={kpi.title} kpiId={Dashboard ? kpi.id : undefined}>
      {Dashboard ? (
        <Dashboard />
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-navy/20 bg-muted/40 px-6 py-20 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-navy/10 text-navy">
            <Construction className="size-7" />
          </span>

          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-navy">
              {kpi.label} dashboard coming soon
            </h3>

            <p className="max-w-md text-sm text-muted-foreground">
              This KPI has been reserved in the reporting portal. Its dashboard
              has not been published yet — check back once the data source is
              connected.
            </p>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
