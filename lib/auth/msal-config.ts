import type { Configuration, RedirectRequest } from "@azure/msal-browser";

/**
 * Client-safe MSAL configuration.
 *
 * NEXT_PUBLIC_* values are public by design.
 * Never place client secrets in this file.
 */

export const AUTH_MODE = process.env.NEXT_PUBLIC_AUTH_MODE ?? "dev";

export const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID ?? "";

export const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ?? "";

export const apiScope =
  process.env.NEXT_PUBLIC_AZURE_API_SCOPE ??
  (clientId ? `api://${clientId}/access_as_user` : "");

export const redirectUri = process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI ?? "";

export const postLogoutRedirectUri =
  process.env.NEXT_PUBLIC_AZURE_POST_LOGOUT_URI ?? "";

/**
 * MSAL is enabled only when:
 *
 * - AUTH_MODE explicitly equals "msal"
 * - tenant ID exists
 * - client ID exists
 * - API scope exists
 * - redirect URI exists
 *
 * This avoids silently entering MSAL mode with incomplete config.
 */
export const isMsalEnabled =
  AUTH_MODE === "msal" &&
  Boolean(tenantId && clientId && apiScope && redirectUri);

/**
 * Fail early when MSAL was explicitly requested
 * but required configuration is incomplete.
 */
if (AUTH_MODE === "msal") {
  const missing: string[] = [];

  if (!clientId) {
    missing.push("NEXT_PUBLIC_AZURE_CLIENT_ID");
  }

  if (!tenantId) {
    missing.push("NEXT_PUBLIC_AZURE_TENANT_ID");
  }

  if (!apiScope) {
    missing.push("NEXT_PUBLIC_AZURE_API_SCOPE");
  }

  if (!redirectUri) {
    missing.push("NEXT_PUBLIC_AZURE_REDIRECT_URI");
  }

  if (missing.length > 0) {
    throw new Error(
      `Microsoft Entra authentication is not fully configured. Missing: ${missing.join(
        ", ",
      )}`,
    );
  }
}

/**
 * MSAL browser configuration.
 */
export const msalConfig: Configuration = {
  auth: {
    clientId,

    authority: `https://login.microsoftonline.com/${tenantId}`,

    redirectUri,

    postLogoutRedirectUri:
      postLogoutRedirectUri || `${redirectUri}?loggedOut=true`,
  },

  cache: {
    cacheLocation: "sessionStorage",
  },
};

/**
 * Interactive Microsoft sign-in request.
 *
 * The API scope is the important one.
 * OIDC scopes are also requested for identity information.
 */
export const loginRequest: RedirectRequest = {
  scopes: [apiScope, "openid", "profile", "email"].filter(Boolean),
};
