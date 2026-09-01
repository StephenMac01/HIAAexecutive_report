"use client";

import { useState } from "react";
import { ensureMsalInitialized } from "@/lib/auth/msal-instance";

export default function LogoutButton() {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      // First remove our server-side HIAA session cookie.
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // Then terminate the Microsoft Entra/MSAL session.
      const msal = await ensureMsalInitialized();

      const account =
        msal.getActiveAccount() ?? msal.getAllAccounts()[0] ?? undefined;

      await msal.logoutRedirect({
        account,
        postLogoutRedirectUri:
          process.env.NEXT_PUBLIC_AZURE_POST_LOGOUT_URI ??
          `${window.location.origin}/login`,
      });
    } catch (error) {
      console.error("Logout failed:", error);

      // Our HIAA cookie has already been removed.
      // Return to login rather than leaving the user on the dashboard.
      window.location.assign("/login?loggedOut=true");
    }
  }

  return (
    <button type="button" onClick={handleLogout} disabled={loggingOut}>
      {loggingOut ? "Signing out..." : "Logout"}
    </button>
  );
}
