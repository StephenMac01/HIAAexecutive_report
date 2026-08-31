"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { useMsal } from "@azure/msal-react"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Client logout for browser-only (MSAL) auth: clear the server session cookie,
 * then clear MSAL's browser cache. Only rendered when MSAL is enabled and a
 * user is signed in, so `useMsal()` always has a provider above it.
 */
export function LogoutButton({ className, label = "Logout" }: { className?: string; label?: string }) {
  const { instance } = useMsal()
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const signOut = useCallback(async () => {
    setBusy(true)
    try {
      // End the server session first so SSR immediately sees us as signed out.
      await fetch("/api/auth/session", { method: "DELETE" })
      const account = instance.getActiveAccount() ?? instance.getAllAccounts()[0]
      await instance.logoutPopup({ account, postLogoutRedirectUri: "/login" }).catch(() => {
        // If the popup is blocked/closed, still clear local cache.
      })
    } finally {
      router.replace("/login")
      router.refresh()
    }
  }, [instance, router])

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-navy-foreground transition-colors hover:bg-navy/90 disabled:opacity-60",
        className,
      )}
    >
      <LogOut className="size-4" />
      <span>{label}</span>
    </button>
  )
}
