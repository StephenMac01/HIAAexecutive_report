import "server-only"

/**
 * Microsoft Graph app-only (client credentials) access for reading KPI
 * workbooks out of a SharePoint document library.
 *
 * All configuration comes from environment variables so the same code runs in
 * preview (no creds → callers fall back to local files) and production:
 *
 *   SHAREPOINT_TENANT_ID      Directory (tenant) ID of the Entra app registration
 *   SHAREPOINT_CLIENT_ID      Application (client) ID
 *   SHAREPOINT_CLIENT_SECRET  Client secret value
 *   SHAREPOINT_SITE_URL       e.g. https://commissionairesns.sharepoint.com/sites/HIAAKPIs
 *   SHAREPOINT_BASE_PATH      optional sub-folder inside the document library
 *                             (e.g. "General" for a Teams channel folder)
 *   SHAREPOINT_FILE_TEMPLATE  optional file-name layout, default "{id}.xlsx"
 *                             (see lib/kpi-data/workbook-source.ts)
 *
 * NOTE: use the plain site URL, NOT a browser "Copy link" URL such as
 *   .../:x:/r/sites/HIAAKPIs/_layouts/15/Doc.aspx?sourcedoc={GUID}&file=kpi-01.xlsx
 * The Graph client resolves files by site + folder path, so the share-link
 * GUID is neither needed nor used.
 */

const GRAPH_ROOT = "https://graph.microsoft.com/v1.0"

export type SharePointConfig = {
  tenantId: string
  clientId: string
  clientSecret: string
  siteUrl: string
  basePath: string
}

/**
 * Read + validate SharePoint configuration. Returns `null` when any required
 * variable is missing, which is the signal for callers to use local fallback
 * data instead of failing.
 */
export function getSharePointConfig(): SharePointConfig | null {
  const tenantId = process.env.SHAREPOINT_TENANT_ID
  const clientId = process.env.SHAREPOINT_CLIENT_ID
  const clientSecret = process.env.SHAREPOINT_CLIENT_SECRET
  const siteUrl = process.env.SHAREPOINT_SITE_URL

  if (!tenantId || !clientId || !clientSecret || !siteUrl) return null

  return {
    tenantId,
    clientId,
    clientSecret,
    siteUrl,
    // Normalize the optional base path to "" or "trimmed/segments".
    basePath: (process.env.SHAREPOINT_BASE_PATH ?? "").replace(/^\/+|\/+$/g, ""),
  }
}

/** Whether a full SharePoint configuration is present. */
export function isSharePointConfigured(): boolean {
  return getSharePointConfig() !== null
}

// --- Token cache -----------------------------------------------------------

let cachedToken: { value: string; expiresAt: number } | null = null

/** Fetch (and cache in-memory) an app-only Graph access token. */
async function getAccessToken(config: SharePointConfig): Promise<string> {
  // Reuse the cached token until 60s before expiry.
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.value
  }

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  })

  const res = await fetch(`https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    // Auth tokens must never be cached by Next's fetch cache.
    cache: "no-store",
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`SharePoint token request failed (${res.status}): ${detail.slice(0, 300)}`)
  }

  const json = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  }
  return cachedToken.value
}

// --- Site resolution -------------------------------------------------------

let cachedSiteId: string | null = null

/**
 * Resolve the Graph `siteId` for the configured `SHAREPOINT_SITE_URL`.
 * Cached in-memory since the site id is stable for the app's lifetime.
 */
async function getSiteId(config: SharePointConfig, token: string): Promise<string> {
  if (cachedSiteId) return cachedSiteId

  const url = new URL(config.siteUrl)
  const hostname = url.hostname
  // Path like "/sites/HIAA-KPIs" → "sites/HIAA-KPIs".
  const sitePath = url.pathname.replace(/^\/+|\/+$/g, "")

  const res = await fetch(`${GRAPH_ROOT}/sites/${hostname}:/${sitePath}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`SharePoint site lookup failed (${res.status}): ${detail.slice(0, 300)}`)
  }

  const json = (await res.json()) as { id: string }
  cachedSiteId = json.id
  return json.id
}

/** Request timeout (ms) for a single Graph download attempt. Env-tunable. */
function downloadTimeoutMs(): number {
  const raw = Number(process.env.SHAREPOINT_TIMEOUT_MS)
  return Number.isFinite(raw) && raw > 0 ? raw : 15_000
}

/** Max retry attempts for transient failures (throttling / 5xx / network). */
function maxRetries(): number {
  const raw = Number(process.env.SHAREPOINT_MAX_RETRIES)
  return Number.isFinite(raw) && raw >= 0 ? Math.min(raw, 5) : 3
}

/** Categorized download error so callers can log/handle each case distinctly. */
export class SharePointDownloadError extends Error {
  constructor(
    message: string,
    readonly category: "auth" | "not-found" | "permission" | "throttled" | "server" | "network" | "unknown",
    readonly status?: number,
  ) {
    super(message)
    this.name = "SharePointDownloadError"
  }
}

function categorizeStatus(status: number): SharePointDownloadError["category"] {
  if (status === 401) return "auth"
  if (status === 403) return "permission"
  if (status === 404) return "not-found"
  if (status === 429) return "throttled"
  if (status >= 500) return "server"
  return "unknown"
}

/** Only transient failures are worth retrying; auth/permission/404 are not. */
function isRetryable(category: SharePointDownloadError["category"]): boolean {
  return category === "throttled" || category === "server" || category === "network"
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Download the raw bytes of a file from the site's default document library,
 * given a drive-relative path (e.g. "kpi-01/kpi-01.xlsx").
 *
 * `revalidateTag` lets the ISR layer cache the download for a window and be
 * force-invalidated by the webhook. Set `cacheSeconds` to 0 for no caching
 * (used by the live download endpoint).
 *
 * Each attempt is bounded by a timeout (AbortController). Transient failures
 * (HTTP 429 with `Retry-After`, 5xx, and network errors) are retried with
 * exponential backoff; authentication (401), permission (403), and not-found
 * (404) are surfaced immediately without retrying.
 */
export async function downloadSiteFile(
  drivePath: string,
  { cacheSeconds, revalidateTag }: { cacheSeconds: number; revalidateTag?: string },
): Promise<ArrayBuffer> {
  const config = getSharePointConfig()
  if (!config) throw new SharePointDownloadError("SharePoint is not configured", "unknown")

  const token = await getAccessToken(config)
  const siteId = await getSiteId(config, token)

  const fullPath = [config.basePath, drivePath].filter(Boolean).join("/")
  const encodedPath = fullPath
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/")
  const url = `${GRAPH_ROOT}/sites/${siteId}/drive/root:/${encodedPath}:/content`

  const attempts = maxRetries() + 1
  let lastError: SharePointDownloadError | null = null

  for (let attempt = 0; attempt < attempts; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), downloadTimeoutMs())
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
        ...(cacheSeconds > 0
          ? { next: { revalidate: cacheSeconds, tags: revalidateTag ? [revalidateTag] : undefined } }
          : { cache: "no-store" }),
      })

      if (res.ok) return await res.arrayBuffer()

      const category = categorizeStatus(res.status)
      // Do not leak response bodies (may contain tokens/paths) — keep it terse.
      lastError = new SharePointDownloadError(
        `SharePoint download failed for "${fullPath}" (${res.status} ${category})`,
        category,
        res.status,
      )
      if (!isRetryable(category) || attempt === attempts - 1) throw lastError

      // Honor Retry-After for throttling, else exponential backoff w/ jitter.
      const retryAfter = Number(res.headers.get("retry-after"))
      const backoff = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 500
      await sleep(backoff + Math.random() * 250)
    } catch (err) {
      if (err instanceof SharePointDownloadError) {
        if (!isRetryable(err.category) || attempt === attempts - 1) throw err
        lastError = err
      } else {
        // Network error or timeout abort — retryable.
        lastError = new SharePointDownloadError(
          err instanceof Error ? err.message : "network error",
          "network",
        )
        if (attempt === attempts - 1) throw lastError
      }
      await sleep(2 ** attempt * 500 + Math.random() * 250)
    } finally {
      clearTimeout(timer)
    }
  }

  throw lastError ?? new SharePointDownloadError(`SharePoint download failed for "${fullPath}"`, "unknown")
}

// --- Diagnostics -----------------------------------------------------------

export type DiagnosticStage = {
  stage: string
  ok: boolean
  detail: string
  ms: number
}

export type SharePointDiagnostics = {
  configured: boolean
  overallOk: boolean
  resolvedPath: string
  stages: DiagnosticStage[]
}

/**
 * Run the full SharePoint → Graph download path for a single drive-relative
 * file and report the outcome of each stage (config, token, site, download).
 *
 * This is the definitive answer to "can graph-client download this file?" It
 * intentionally bypasses the local fallback and the ISR cache so the result
 * reflects the live Graph connection only. It never throws — every failure is
 * captured as a stage so the caller always gets a structured report.
 */
export async function diagnoseSharePointDownload(drivePath: string): Promise<SharePointDiagnostics> {
  const stages: DiagnosticStage[] = []
  const time = async <T>(stage: string, fn: () => Promise<T>): Promise<T> => {
    const start = Date.now()
    try {
      const value = await fn()
      stages.push({ stage, ok: true, detail: "ok", ms: Date.now() - start })
      return value
    } catch (error) {
      stages.push({
        stage,
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
        ms: Date.now() - start,
      })
      throw error
    }
  }

  const config = getSharePointConfig()
  if (!config) {
    return {
      configured: false,
      overallOk: false,
      resolvedPath: drivePath,
      stages: [
        {
          stage: "config",
          ok: false,
          detail:
            "Missing one or more of SHAREPOINT_TENANT_ID, SHAREPOINT_CLIENT_ID, SHAREPOINT_CLIENT_SECRET, SHAREPOINT_SITE_URL.",
          ms: 0,
        },
      ],
    }
  }

  const fullPath = [config.basePath, drivePath].filter(Boolean).join("/")
  stages.push({
    stage: "config",
    ok: true,
    detail: `site=${config.siteUrl} path=${fullPath}`,
    ms: 0,
  })

  try {
    const token = await time("token", () => getAccessToken(config))
    const siteId = await time("site", () => getSiteId(config, token))
    const bytes = await time("download", async () => {
      const encodedPath = fullPath
        .split("/")
        .map((seg) => encodeURIComponent(seg))
        .join("/")
      const res = await fetch(`${GRAPH_ROOT}/sites/${siteId}/drive/root:/${encodedPath}:/content`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      if (!res.ok) {
        const detail = await res.text().catch(() => "")
        throw new Error(`HTTP ${res.status}: ${detail.slice(0, 200)}`)
      }
      return res.arrayBuffer()
    })

    // Annotate the download stage with the byte count for a clear success signal.
    const dl = stages.find((s) => s.stage === "download")
    if (dl) dl.detail = `downloaded ${bytes.byteLength.toLocaleString()} bytes`

    return { configured: true, overallOk: true, resolvedPath: fullPath, stages }
  } catch {
    return { configured: true, overallOk: false, resolvedPath: fullPath, stages }
  }
}
