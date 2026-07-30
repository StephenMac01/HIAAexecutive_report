import "server-only";

/**
 * Microsoft Graph app-only access for reading KPI Excel workbooks from
 * a SharePoint document library.
 *
 * Required environment variables:
 *
 * SHAREPOINT_TENANT_ID
 * SHAREPOINT_CLIENT_ID
 * SHAREPOINT_CLIENT_SECRET
 * SHAREPOINT_SITE_URL
 *
 * Optional:
 *
 * SHAREPOINT_BASE_PATH
 *
 * Example site URL:
 *
 * https://commissionairesns.sharepoint.com/sites/HIAAKPIs
 *
 * Use the plain SharePoint site URL, not a browser "Copy link" URL.
 */

const GRAPH_ROOT = "https://graph.microsoft.com/v1.0";

export type SharePointConfig = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  siteUrl: string;
  basePath: string;
};

/**
 * Read and validate the SharePoint environment variables.
 */
export function getSharePointConfig(): SharePointConfig | null {
  const tenantId = process.env.SHAREPOINT_TENANT_ID?.trim();
  const clientId = process.env.SHAREPOINT_CLIENT_ID?.trim();
  const clientSecret = process.env.SHAREPOINT_CLIENT_SECRET?.trim();
  const siteUrl = process.env.SHAREPOINT_SITE_URL?.trim();

  if (!tenantId || !clientId || !clientSecret || !siteUrl) {
    return null;
  }

  return {
    tenantId,
    clientId,
    clientSecret,
    siteUrl,
    basePath: (process.env.SHAREPOINT_BASE_PATH ?? "")
      .trim()
      .replace(/^\/+|\/+$/g, ""),
  };
}

/**
 * Confirm that all required SharePoint settings are available.
 */
export function isSharePointConfigured(): boolean {
  return getSharePointConfig() !== null;
}

// -----------------------------------------------------------------------------
// Microsoft Graph access-token cache
// -----------------------------------------------------------------------------

let cachedToken: {
  value: string;
  expiresAt: number;
} | null = null;

/**
 * Retrieve an app-only Microsoft Graph token.
 *
 * The token is cached in memory until 60 seconds before its expiry.
 */
async function getAccessToken(config: SharePointConfig): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.value;
  }

  const tokenUrl =
    `https://login.microsoftonline.com/` +
    `${config.tenantId}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");

    throw new Error(
      `SharePoint token request failed ` +
        `(${response.status} ${response.statusText}): ` +
        `${detail.slice(0, 300)}`,
    );
  }

  const result = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!result.access_token) {
    throw new Error("Microsoft token response did not include an access token");
  }

  cachedToken = {
    value: result.access_token,
    expiresAt: Date.now() + (result.expires_in ?? 3600) * 1000,
  };

  return cachedToken.value;
}

// -----------------------------------------------------------------------------
// SharePoint site resolution
// -----------------------------------------------------------------------------

let cachedSiteId: string | null = null;

/**
 * Resolve the configured SharePoint site URL into a Microsoft Graph site ID.
 */
async function getSiteId(
  config: SharePointConfig,
  token: string,
): Promise<string> {
  if (cachedSiteId) {
    return cachedSiteId;
  }

  let parsedSiteUrl: URL;

  try {
    parsedSiteUrl = new URL(config.siteUrl);
  } catch {
    throw new Error(`Invalid SHAREPOINT_SITE_URL: ${config.siteUrl}`);
  }

  const hostname = parsedSiteUrl.hostname;
  const sitePath = parsedSiteUrl.pathname.replace(/^\/+|\/+$/g, "");

  if (!hostname || !sitePath) {
    throw new Error(`Invalid SHAREPOINT_SITE_URL: ${config.siteUrl}`);
  }

  const siteLookupUrl = `${GRAPH_ROOT}/sites/${hostname}:/${sitePath}`;

  const response = await fetch(siteLookupUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");

    throw new Error(
      `SharePoint site lookup failed for "${config.siteUrl}" ` +
        `(${response.status} ${response.statusText}): ` +
        `${detail.slice(0, 300)}`,
    );
  }

  const result = (await response.json()) as {
    id?: string;
  };

  if (!result.id) {
    throw new Error(
      `SharePoint site lookup returned no site ID for ` + `"${config.siteUrl}"`,
    );
  }

  cachedSiteId = result.id;

  return cachedSiteId;
}

// -----------------------------------------------------------------------------
// Workbook download
// -----------------------------------------------------------------------------

/**
 * Download a file from the SharePoint site's default document library.
 *
 * Example drive paths:
 *
 * kpi-01.xlsx
 * kpi-01/kpi-01.xlsx
 * KPI Dashboard Data/kpi-01/kpi-01.xlsx
 *
 * All requests use cache: "no-store" because the consuming dashboard pages
 * are rendered dynamically from the current SharePoint workbook.
 */
export async function downloadSiteFile(
  drivePath: string,
): Promise<ArrayBuffer> {
  const config = getSharePointConfig();

  if (!config) {
    throw new Error("SharePoint is not configured");
  }

  const normalizedDrivePath = drivePath.trim().replace(/^\/+|\/+$/g, "");

  if (!normalizedDrivePath) {
    throw new Error("A SharePoint drive path was not provided");
  }

  const token = await getAccessToken(config);
  const siteId = await getSiteId(config, token);

  const fullPath = [config.basePath, normalizedDrivePath]
    .filter(Boolean)
    .join("/");

  const encodedPath = fullPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const downloadUrl =
    `${GRAPH_ROOT}/sites/${siteId}/drive/root:` + `/${encodedPath}:/content`;

  console.log(`[CNS HIAA] Loading SharePoint workbook: ${fullPath}`);

  const response = await fetch(downloadUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
    cache: "no-store",
    redirect: "follow",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");

    throw new Error(
      `SharePoint file download failed for "${fullPath}" ` +
        `(${response.status} ${response.statusText}): ` +
        `${detail.slice(0, 300)}`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (
    contentType.includes("text/html") ||
    contentType.includes("application/json")
  ) {
    const detail = await response.text().catch(() => "");

    throw new Error(
      `Unexpected SharePoint response for "${fullPath}". ` +
        `Content-Type: ${contentType}. ` +
        `Response: ${detail.slice(0, 300)}`,
    );
  }

  return response.arrayBuffer();
}
