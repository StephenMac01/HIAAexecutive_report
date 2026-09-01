"use client";

import { useCallback, useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { InteractionRequiredAuthError } from "@azure/msal-browser";

import Loading from "@/app/loading";
import LoginForm from "./LoginForm";

import { apiScope, isMsalEnabled, loginRequest } from "@/lib/auth/msal-config";

import { ensureMsalInitialized } from "@/lib/auth/msal-instance";

/**
 * Only allow redirects to local application paths.
 *
 * Prevents:
 *   ?next=https://evil.example
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
 * Convert login query-string flags into user-facing
 * status messages.
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
 * Interactive authentication is initiated ONLY when
 * the user clicks Sign in with Microsoft.
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
   * Exchange the Entra access token for the
   * application's own httpOnly session cookie.
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
          "Your Microsoft account is authenticated, but you are not authorized to use this application.",
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
   * Process an MSAL redirect response if one exists.
   *
   * IMPORTANT:
   *
   * This effect NEVER starts interactive login.
   *
   * Interactive login only happens from
   * handleSignIn().
   */
  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      await Promise.resolve();

      if (cancelled) {
        return;
      }

      try {
        if (!apiScope) {
          throw new Error("NEXT_PUBLIC_AZURE_API_SCOPE is not configured.");
        }

        /**
         * Entra interactive authentication must run
         * in a normal top-level browser window.
         */
        if (window.self !== window.top) {
          throw new Error(
            "Microsoft sign-in cannot run inside an embedded browser. Open the application directly in Microsoft Edge or Google Chrome.",
          );
        }

        const msal = await ensureMsalInitialized();

        if (cancelled) {
          return;
        }

        /**
         * Complete a redirect that was started by
         * loginRedirect().
         */
        const redirectResult = await msal.handleRedirectPromise();

        if (cancelled) {
          return;
        }

        const account =
          redirectResult?.account ??
          msal.getActiveAccount() ??
          msal.getAllAccounts()[0];

        /**
         * No account means this is simply the normal
         * first visit to /login.
         *
         * Show the button and wait for the user.
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

        /**
         * loginRedirect() may already have returned
         * the requested API access token.
         */
        let accessToken = redirectResult?.accessToken ?? "";

        /**
         * Otherwise acquire it silently.
         *
         * Never call acquireTokenRedirect() from
         * this effect.
         */
        if (!accessToken) {
          try {
            const tokenResult = await msal.acquireTokenSilent({
              scopes: [apiScope],

              account,

              /**
               * Useful while Entra App Role
               * assignments are being changed.
               */
              forceRefresh: true,
            });

            accessToken = tokenResult.accessToken;
          } catch (tokenError) {
            if (tokenError instanceof InteractionRequiredAuthError) {
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

        /**
         * Create our own signed application session.
         */
        await createServerSession(accessToken);

        if (cancelled) {
          return;
        }

        /**
         * Authentication and authorization completed.
         */
        router.replace(next);
        router.refresh();
      } catch (err) {
        if (cancelled) {
          return;
        }

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
  }, [createServerSession, next, router]);

  /**
   * The ONLY location that deliberately starts
   * interactive Microsoft authentication.
   */
  const handleSignIn = useCallback(async () => {
    if (busy) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      if (!apiScope) {
        throw new Error("Microsoft Entra authentication is not configured.");
      }

      if (window.self !== window.top) {
        throw new Error(
          "Microsoft sign-in cannot run inside an embedded browser. Open the application directly in Microsoft Edge or Google Chrome.",
        );
      }

      const msal = await ensureMsalInitialized();

      /**
       * Preserve an existing selected account if
       * MSAL already knows about one.
       */
      const currentAccount =
        msal.getActiveAccount() ?? msal.getAllAccounts()[0];

      if (currentAccount) {
        msal.setActiveAccount(currentAccount);
      }

      /**
       * Start Microsoft interactive login in the
       * TOP-LEVEL browser window.
       *
       * No popup flow is used.
       */
      await msal.loginRedirect({
        ...loginRequest,

        scopes: [apiScope, "openid", "profile", "email"].filter(Boolean),

        /**
         * Explicit account selection is useful
         * while testing role assignments.
         *
         * You can remove this later if you want
         * seamless account reuse.
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
  }, [busy]);

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
