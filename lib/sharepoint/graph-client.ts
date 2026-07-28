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

/**
 * Download the raw bytes of a file from the site's default document library,
 * given a drive-relative path (e.g. "kpi-01/kpi-01.xlsx").
 *
 * `revalidateTag` lets the ISR layer cache the download for a window and be
 * force-invalidated by the webhook. Set `cacheSeconds` to 0 for no caching
 * (used by the live download endpoint).
 */
export async function downloadSiteFile(
  drivePath: string,
  { cacheSeconds, revalidateTag }: { cacheSeconds: number; revalidateTag?: string },
): Promise<ArrayBuffer> {
  const config = getSharePointConfig()
  if (!config) throw new Error("SharePoint is not configured")

  const token = await getAccessToken(config)
  const siteId = await getSiteId(config, token)

  const fullPath = [config.basePath, drivePath].filter(Boolean).join("/")
  const encodedPath = fullPath
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/")

  const res = await fetch(`${GRAPH_ROOT}/sites/${siteId}/drive/root:/${encodedPath}:/content`, {
    headers: { Authorization: `Bearer ${token}` },
    ...(cacheSeconds > 0
      ? { next: { revalidate: cacheSeconds, tags: revalidateTag ? [revalidateTag] : undefined } }
      : { cache: "no-store" }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`SharePoint file download failed for "${fullPath}" (${res.status}): ${detail.slice(0, 300)}`)
  }

  return res.arrayBuffer()
}
