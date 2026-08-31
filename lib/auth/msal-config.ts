import type { Configuration, RedirectRequest } from "@azure/msal-browser";

/**
 * Client-safe MSAL configuration.
 *
 * NEXT_PUBLIC_* values are public by design.
 * Do not put client secrets in this file.
 */

export const AUTH_MODE = process.env.NEXT_PUBLIC_AUTH_MODE ?? "dev";

export const isMsalEnabled = AUTH_MODE === "msal";

const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ?? "";

const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID ?? "";

/**
 * Scope exposed by this application's API:
 * Expose an API -> access_as_user
 */
export const apiScope =
  process.env.NEXT_PUBLIC_AZURE_API_SCOPE ||
  (clientId ? `api://${clientId}/access_as_user` : "");

/**
 * Fail early if MSAL mode is enabled but required
 * configuration is missing.
 */
if (isMsalEnabled) {
  if (!clientId) {
    throw new Error(
      "NEXT_PUBLIC_AZURE_CLIENT_ID is required when NEXT_PUBLIC_AUTH_MODE=msal",
    );
  }

  if (!tenantId) {
    throw new Error(
      "NEXT_PUBLIC_AZURE_TENANT_ID is required when NEXT_PUBLIC_AUTH_MODE=msal",
    );
  }

  if (!apiScope) {
    throw new Error(
      "NEXT_PUBLIC_AZURE_API_SCOPE is required when NEXT_PUBLIC_AUTH_MODE=msal",
    );
  }
}

export const msalConfig: Configuration = {
  auth: {
    clientId,

    authority: `https://login.microsoftonline.com/${tenantId}`,

    redirectUri: process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI || "/login",

    postLogoutRedirectUri:
      process.env.NEXT_PUBLIC_AZURE_POST_LOGOUT_URI || "/login?loggedOut=true",
  },

  cache: {
    cacheLocation: "sessionStorage",
  },
};

/**
 * Interactive Microsoft sign-in.
 */
export const loginRequest: RedirectRequest = {
  scopes: [apiScope, "openid", "profile", "email"].filter(Boolean),
};
