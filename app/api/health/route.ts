import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { KPIS, getKpi } from "@/lib/kpi-registry"
import { isSharePointConfigured } from "@/lib/sharepoint/graph-client"
import { diagnoseKpiSource, kpiCacheTag } from "@/lib/sharepoint/workbook-source"

export const dynamic = "force-dynamic"

/**
 * Operational health + readiness endpoint.
 *
 * GET /api/health
 *   Lightweight liveness/readiness. Verifies the process is up, required env
 *   vars are present, workbook mappings exist for all 21 KPIs, and the cache
 *   layer is callable. Downloads NO workbooks — safe for frequent polling by a
 *   load balancer or uptime monitor.
 *
 * GET /api/health?deep=1   (requires x-revalidate-secret / ?secret)
 *   Deep readiness probe. Additionally runs one live SharePoint → Graph →
 *   workbook download for kpi-01 to confirm auth, site/drive reachability, and
 *   that a real workbook parses. Guarded because it makes an external call.
 *
 * Never returns secrets, tokens, or workbook contents.
 */

type Check = { name: string; ok: boolean; detail: string }

function envPresence() {
  // Report presence only — never the values.
  const required = ["SHAREPOINT_TENANT_ID", "SHAREPOINT_CLIENT_ID", "SHAREPOINT_CLIENT_SECRET", "SHAREPOINT_SITE_URL"]
  const optional = ["SHAREPOINT_BASE_PATH", "SHAREPOINT_FILE_TEMPLATE", "KPI_CACHE_TTL_SECONDS", "REVALIDATE_SECRET"]
  const present = (k: string) => Boolean(process.env[k]?.trim())
  return {
    required: Object.fromEntries(required.map((k) => [k, present(k)])),
    optional: Object.fromEntries(optional.map((k) => [k, present(k)])),
    allRequiredPresent: required.every(present),
  }
}

function isAuthorized(request: Request): boolean {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) return false
  const provided = request.headers.get("x-revalidate-secret") ?? new URL(request.url).searchParams.get("secret")
  return provided === secret
}

export async function GET(request: Request) {
  const checks: Check[] = []

  checks.push({ name: "process", ok: true, detail: "application is running" })

  // Workbook mappings: registry must cover kpi-01 … kpi-21 with no gaps.
  const missing = Array.from({ length: 21 }, (_, i) => `kpi-${String(i + 1).padStart(2, "0")}`).filter(
    (id) => !getKpi(id),
  )
  checks.push({
    name: "kpi-mappings",
    ok: missing.length === 0 && KPIS.length === 21,
    detail: missing.length === 0 ? `all 21 KPI mappings present` : `missing: ${missing.join(", ")}`,
  })

  // Cache layer: revalidateTag must be callable without throwing.
  let cacheOk = true
  try {
    revalidateTag(kpiCacheTag("kpi-01"), "max")
  } catch {
    cacheOk = false
  }
  checks.push({ name: "cache", ok: cacheOk, detail: cacheOk ? "revalidation API operational" : "revalidateTag failed" })

  const env = envPresence()
  checks.push({
    name: "sharepoint-config",
    ok: true, // config is optional — local fallback keeps the app healthy
    detail: isSharePointConfigured()
      ? "configured"
      : "not configured (serving local fallback workbooks)",
  })

  const deep = new URL(request.url).searchParams.get("deep")
  let readiness: Record<string, unknown> | undefined

  if (deep) {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized (deep readiness requires REVALIDATE_SECRET)" }, { status: 401 })
    }
    if (!isSharePointConfigured()) {
      readiness = { skipped: true, reason: "SharePoint not configured" }
    } else {
      // Single live probe against kpi-01 — never all 21.
      const diag = await diagnoseKpiSource("kpi-01")
      readiness = {
        overallOk: diag.overallOk,
        parseOk: diag.parse.ok,
        stages: diag.stages.map((s) => ({ stage: s.stage, ok: s.ok, ms: s.ms })),
      }
      checks.push({
        name: "sharepoint-readiness",
        ok: diag.overallOk && diag.parse.ok,
        detail: diag.overallOk ? "live download + parse succeeded for kpi-01" : "live probe failed",
      })
    }
  }

  const ok = checks.every((c) => c.ok)
  return NextResponse.json(
    {
      status: ok ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
      env,
      ...(readiness ? { readiness } : {}),
    },
    { status: ok ? 200 : 503 },
  )
}
