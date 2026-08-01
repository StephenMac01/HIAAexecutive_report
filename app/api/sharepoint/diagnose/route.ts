import { NextResponse } from "next/server"
import { getKpi } from "@/lib/kpi-registry"
import { diagnoseKpiSource } from "@/lib/sharepoint/workbook-source"

export const dynamic = "force-dynamic"

/**
 * SharePoint connectivity self-test.
 *
 * Answers the one question that determines all remaining work:
 *   "Can graph-client download kpi-01.xlsx from SharePoint?"
 *
 * It runs the live pipeline stage by stage (config → token → site → download →
 * parse) and returns a structured report. It bypasses the local fallback, so a
 * green result means Graph itself is working; a red stage points at exactly
 * what to fix (permissions, env vars, or the SharePoint path).
 *
 * Usage:
 *   GET /api/sharepoint/diagnose             tests kpi-01
 *   GET /api/sharepoint/diagnose?kpi=kpi-07  tests a specific KPI
 *
 * Auth: when REVALIDATE_SECRET is set (production), pass it via the
 * `x-revalidate-secret` header or `?secret=` query. In development (no secret
 * set) it is open so the connection can be verified quickly.
 */
function authorize(request: Request): boolean {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) return process.env.NODE_ENV !== "production"
  const provided =
    request.headers.get("x-revalidate-secret") ?? new URL(request.url).searchParams.get("secret")
  return provided === secret
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const kpiId = new URL(request.url).searchParams.get("kpi") ?? "kpi-01"
  if (!getKpi(kpiId)) {
    return NextResponse.json({ error: `Unknown KPI: ${kpiId}` }, { status: 404 })
  }

  const result = await diagnoseKpiSource(kpiId)

  const summary = !result.configured
    ? "SharePoint is NOT configured — the app is serving local fallback data. Set the SHAREPOINT_* environment variables to go live."
    : result.overallOk && result.parse.ok
      ? `SUCCESS: ${kpiId} downloaded and parsed live from SharePoint.`
      : `FAILED at the "${result.stages.find((s) => !s.ok)?.stage ?? "parse"}" stage — see stages for the exact error.`

  return NextResponse.json(
    { summary, ...result },
    { status: result.overallOk && result.parse.ok ? 200 : result.configured ? 502 : 200 },
  )
}
