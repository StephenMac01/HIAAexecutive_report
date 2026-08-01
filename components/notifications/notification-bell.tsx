"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Bell, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchInbox, markAllNotificationsRead } from "@/app/actions/notifications"
import type { InboxItem } from "@/lib/notifications/types"
import { SeverityDot, relativeTime } from "./shared"

/**
 * Header notification bell: unread badge + dropdown of recent alerts.
 * Self-contained — pulls its own data via the `fetchInbox` server action and
 * polls periodically so new alerts surface without a full page reload.
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<InboxItem[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const { items, unread } = await fetchInbox()
      setItems(items)
      setUnread(unread)
    } catch {
      // Fail soft: the bell should never break the header.
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 45_000)
    return () => clearInterval(id)
  }, [load])

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  async function handleMarkAll() {
    setUnread(0)
    setItems((prev) => prev.map((i) => ({ ...i, status: "read" as const })))
    try {
      await markAllNotificationsRead()
    } finally {
      load()
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
        className="relative flex size-9 items-center justify-center rounded-lg border border-navy/15 bg-card text-navy transition-colors hover:bg-muted"
      >
        <Bell className="size-4" />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-4 text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-navy/15 bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold text-navy">Notifications</span>
            {unread > 0 ? (
              <button
                type="button"
                onClick={handleMarkAll}
                className="flex items-center gap-1 text-xs font-medium text-aviation hover:underline"
              >
                <Check className="size-3" /> Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
            ) : (
              <ul className="divide-y divide-border">
                {items.slice(0, 8).map((item) => (
                  <li
                    key={item.deliveryId}
                    className={cn("flex gap-3 px-4 py-3", item.status === "unread" && "bg-muted/40")}
                  >
                    <SeverityDot severity={item.event.severity} className="mt-1.5" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-navy">{item.event.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.event.body}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{relativeTime(item.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-border px-4 py-3 text-center text-sm font-medium text-aviation hover:bg-muted"
          >
            View all notifications
          </Link>
        </div>
      ) : null}
    </div>
  )
}
