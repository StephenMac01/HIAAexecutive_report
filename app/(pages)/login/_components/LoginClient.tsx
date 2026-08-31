"use client";

import { useCallback, useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { InteractionRequiredAuthError } from "@azure/msal-browser";

import Loading from "@/app/loading";
import LoginForm from "./LoginForm";

import { apiScope, isMsalEnabled } from "@/lib/auth/msal-config";

import { ensureMsalInitialized } from "@/lib/auth/msal-instance";

/**
 * Only allow redirects to local application paths.
 *
 * Prevents:
 * ?next=https://evil.example
 */
function safeNextPath(value: string | null): string {
  if (!value) return "/";

  if (!value.startsWith("/")) {
    return "/";
  }

  if (value.startsWith("//")) {
    return "/";
  }

  return value;
}

/**
 * Convert login query-string flags into
 * user-facing status messages.
 */
function useStatusMessage(): {
  message?: string;
  messageKind?: "success" | "warning" | "info";
} {
  const params = useSearchParams();

  if (params.get("loggedOut") === "true") {
    return {
      message: "You have been signed out.",
      messageKind: "success",
    };
  }

  if (params.get("accessDenied") === "true") {
    return {
      message: "Access denied. Please sign in with an authorized account.",
      messageKind: "warning",
    };
  }

  return {};
}

/**
 * Microsoft Entra/MSAL login.
 *
 * Interactive authentication is initiated ONLY
 * when the user clicks the Sign In button.
 *
 * Flow:
 *
 * /login
 *    ↓
 * Sign in button
 *    ↓
 * loginRedirect()
 *    ↓
 * Microsoft Entra
 *    ↓
 * /login
 *    ↓
 * handleRedirectPromise()
 *    ↓
 * acquire API token
 *    ↓
 * POST /api/auth/session
 *    ↓
 * Server validates:
 *   signature
 *   issuer
 *   audience
 *   expiry
 *   app role
 *    ↓
 * hiaa_session
 *    ↓
 * dashboard
 */
function EntraLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const status = useStatusMessage();

  const next = safeNextPath(params.get("next") ?? params.get("returnTo"));

  const [initializing, setInitializing] = useState(true);

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");

  /**
   * Send the verified Microsoft access token
   * to our server and create the httpOnly
   * hiaa_session cookie.
   */
  const createServerSession = useCallback(async (accessToken: string) => {
    const response = await fetch("/api/auth/session", {
      method: "POST",

      headers: {
        Authorization: `Bearer ${accessToken}`,
      },

      credentials: "include",
      cache: "no-store",
    });

    if (response.ok) {
      return;
    }

    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    if (response.status === 403) {
      throw new Error(
        body.error ??
          "Your Microsoft account is authenticated, but no authorized HIAA application role was found.",
      );
    }

    if (response.status === 401) {
      throw new Error(
        body.error ?? "Microsoft authentication could not be validated.",
      );
    }

    throw new Error(
      body.error ?? `Authentication failed (${response.status}).`,
    );
  }, []);

  /**
   * Complete a Microsoft redirect if one exists.
   *
   * This effect NEVER launches an interactive
   * authentication operation.
   */
  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      /*
       * Avoid running meaningful work during the
       * first development-only Strict Mode effect.
       */
      await Promise.resolve();

      if (cancelled) {
        return;
      }

      try {
        if (!apiScope) {
          throw new Error("NEXT_PUBLIC_AZURE_API_SCOPE is not configured.");
        }

        /*
         * MSAL should run in a normal top-level browser
         * window, not an embedded iframe/webview.
         */
        if (window.self !== window.top) {
          throw new Error(
            "Microsoft sign-in cannot run inside an embedded browser. Open http://localhost:3000/login in Microsoft Edge or Google Chrome.",
          );
        }

        const msal = await ensureMsalInitialized();

        if (cancelled) {
          return;
        }

        /*
         * Complete an existing Microsoft redirect.
         *
         * This MUST happen before using the MSAL account.
         */
        const redirectResult = await msal.handleRedirectPromise();

        if (cancelled) {
          return;
        }

        const account =
          redirectResult?.account ??
          msal.getActiveAccount() ??
          msal.getAllAccounts()[0];

        /*
         * First visit:
         *
         * No Microsoft account exists yet.
         * Show the Sign in with Microsoft button.
         */
        if (!account) {
          setInitializing(false);
          setBusy(false);
          return;
        }

        msal.setActiveAccount(account);

        setInitializing(false);
        setBusy(true);
        setError("");

        /*
         * If loginRedirect already supplied an API
         * access token, use it.
         */
        let accessToken = redirectResult?.accessToken ?? "";

        /*
         * Otherwise try silent token acquisition.
         *
         * IMPORTANT:
         * We do NOT launch acquireTokenRedirect()
         * from this effect.
         */
        if (!accessToken) {
          try {
            const tokenResult = await msal.acquireTokenSilent({
              scopes: [apiScope],
              account,

              /*
               * Useful while role assignments are
               * currently being changed in Entra.
               *
               * It prevents an old access token with
               * roles: [] from being reused.
               */
              forceRefresh: true,
            });

            accessToken = tokenResult.accessToken;
          } catch (tokenError) {
            if (tokenError instanceof InteractionRequiredAuthError) {
              /*
               * Do not initiate another redirect from
               * inside initialization.
               *
               * Let the user explicitly initiate the
               * interactive operation.
               */
              setBusy(false);
              setInitializing(false);

              setError(
                "Microsoft requires an interactive sign-in. Select Sign in with Microsoft to continue.",
              );

              return;
            }

            throw tokenError;
          }
        }

        if (cancelled) {
          return;
        }

        if (!accessToken) {
          throw new Error(
            "Microsoft Entra did not return an API access token.",
          );
        }

        /*
         * Exchange the Microsoft token for the
         * application's own secure session.
         */
        await createServerSession(accessToken);

        if (cancelled) {
          return;
        }

        /*
         * Successful authentication AND authorization.
         */
        router.replace(next);
        router.refresh();
      } catch (err) {
        if (cancelled) {
          return;
        }

        /*
         * Authentication/authorization errors are
         * expected user-flow conditions, so use warn
         * instead of console.error to avoid the large
         * Next.js development error overlay.
         */
        console.warn("[auth] Microsoft login initialization:", err);

        setBusy(false);
        setInitializing(false);

        setError(
          err instanceof Error
            ? err.message
            : "Sign-in could not be completed.",
        );
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [apiScope, createServerSession, next, router]);

  /**
   * The ONLY place we intentionally start
   * Microsoft interactive authentication.
   */
  const handleSignIn = useCallback(async () => {
    try {
      setBusy(true);
      setError("");

      if (!apiScope) {
        throw new Error("NEXT_PUBLIC_AZURE_API_SCOPE is not configured.");
      }

      /*
       * Prevent MSAL authentication from being started
       * inside VS Code Simple Browser or another iframe.
       */
      if (window.self !== window.top) {
        throw new Error(
          "Open this application in Microsoft Edge or Google Chrome before signing in.",
        );
      }

      const msal = await ensureMsalInitialized();

      /*
       * Remove any stale active account selection.
       *
       * We are NOT removing the Microsoft account
       * from MSAL here.
       */
      const currentAccount =
        msal.getActiveAccount() ?? msal.getAllAccounts()[0];

      if (currentAccount) {
        msal.setActiveAccount(currentAccount);
      }

      /*
       * Request our API scope during the primary
       * interactive login.
       *
       * This reduces the likelihood of needing
       * another interactive token operation later.
       */
      await msal.loginRedirect({
        scopes: [apiScope],

        /*
         * Explicitly allow the user to select the
         * Microsoft account during testing.
         */
        prompt: "select_account",

        redirectUri:
          process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI ??
          `${window.location.origin}/login`,
      });
    } catch (err) {
      console.warn("[auth] Could not start Microsoft login:", err);

      setBusy(false);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to start Microsoft sign-in.",
      );
    }
  }, []);

  /*
   * Use the branded full-page loading view only
   * during legitimate processing.
   */
  if (initializing || busy) {
    return <Loading />;
  }

  return (
    <LoginForm
      message={status.message}
      messageKind={status.messageKind}
      error={error}
      busy={busy}
      onSignIn={handleSignIn}
    />
  );
}

/**
 * Login orchestrator.
 */
export default function LoginClient() {
  if (!isMsalEnabled) {
    return (
      <LoginForm error="Microsoft Entra authentication is not configured." />
    );
  }

  return <EntraLogin />;
}
