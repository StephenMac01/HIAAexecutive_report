import { Suspense } from "react";
import type { Metadata } from "next";
import { ExecutiveSummaryDashboard } from "@/components/executive-summary/dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Executive Summary | CNS HIAA Airport KPI Dashboard",
  description:
    "Schedule “D” contract-compliance summary aggregating all 21 CNS HIAA operational KPIs into a single executive view.",
};

export default function ExecutiveSummaryPage() {
  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
          CNS <span className="text-aviation">HIAA</span>
        </h1>

        <p className="text-sm font-medium text-muted-foreground">
          Executive Summary — Schedule &quot;D&quot;
        </p>

        <span
          className="mt-1 h-0.5 w-24 rounded-full bg-aviation"
          aria-hidden="true"
        />
      </div>

      <Suspense
        fallback={
          <div className="py-20 text-center text-muted-foreground">
            Loading executive summary…
          </div>
        }
      >
        <ExecutiveSummaryDashboard />
      </Suspense>
    </main>
  );
}
