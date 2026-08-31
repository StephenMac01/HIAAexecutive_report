"use client";

import { useState } from "react";
import { ensureMsalInitialized } from "@/lib/auth/msal-instance";

export function LogoutButton() {
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    if (busy) return;

    try {
      setBusy(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to clear application session.");
      }

      const msal = await ensureMsalInitialized();

      const account = msal.getActiveAccount() ?? msal.getAllAccounts()[0];

      await msal.logoutRedirect({
        account,
        postLogoutRedirectUri: `${window.location.origin}/login?loggedOut=true`,
      });
    } catch (error) {
      console.error("[auth] Logout failed:", error);

      setBusy(false);

      window.location.assign("/login?loggedOut=true");
    }
  }

  return (
    <button type="button" onClick={handleLogout} disabled={busy}>
      {busy ? "Signing out..." : "Sign out"}
    </button>
  );
}
