"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"

/**
 * Client refresh control for a server-rendered dashboard. Calls
 * `router.refresh()`, which re-runs the server component and re-reads the
 * workbook (subject to its ISR window) without a full page reload.
 */
export function RefreshButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-card-foreground shadow-sm transition-colors hover:bg-muted disabled:opacity-60"
    >
      <RefreshCw className={`size-4${pending ? " animate-spin" : ""}`} aria-hidden="true" />
      {pending ? "Refreshing…" : "Refresh"}
    </button>
  )
}
