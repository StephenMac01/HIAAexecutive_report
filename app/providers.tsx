"use client"

import { MsalProvider } from "@azure/msal-react"
import { getMsalInstance } from "@/lib/auth/msal-instance"
import { isMsalEnabled } from "@/lib/auth/msal-config"

/**
 * Client provider boundary.
 *
 * When MSAL is enabled we wrap the tree in <MsalProvider> so any client
 * component can use the msal-react hooks (useMsal, useIsAuthenticated). The
 * provider initializes the instance internally.
 *
 * When MSAL is disabled (local dev / v0 preview), this is a passthrough — no
 * MSAL code runs and no Entra tenant is required.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  if (!isMsalEnabled) return <>{children}</>
  return <MsalProvider instance={getMsalInstance()}>{children}</MsalProvider>
}
