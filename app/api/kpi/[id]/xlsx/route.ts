import { NextResponse } from "next/server"
import { getKpi } from "@/lib/kpi-registry"
import { getKpiWorkbookForDownload } from "@/lib/sharepoint/workbook-source"
import { requireApiRole } from "@/lib/auth/guard"

// Always serve the freshest bytes so a download matches SharePoint exactly.
export const dynamic = "force-dynamic"

const XLSX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

/**
 * Live download of a KPI's source workbook.
 *
 * Streams the current bytes from SharePoint (or local fallback) rather than a
 * build-time static mirror, so the downloaded file is always current.
 *
 * Access: any signed-in user (viewer+). Without this guard the raw source
 * workbooks could be enumerated and downloaded anonymously by requesting
 * /api/kpi/kpi-01/xlsx … /api/kpi/kpi-21/xlsx.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireApiRole("viewer")
  if (!gate.ok) return gate.response

  const { id } = await params

  // Validate against the registry to avoid arbitrary path access.
  if (!getKpi(id)) {
    return NextResponse.json({ error: "Unknown KPI" }, { status: 404 })
  }

  try {
    const buffer = await getKpiWorkbookForDownload(id)
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": XLSX_CONTENT_TYPE,
        "Content-Disposition": `attachment; filename="${id}.xlsx"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.log("[kpi] KPI download failed:", id, error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Unable to load workbook" }, { status: 502 })
  }
}
