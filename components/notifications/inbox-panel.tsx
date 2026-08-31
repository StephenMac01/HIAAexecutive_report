"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Check, CheckCheck, Inbox } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { markAllNotificationsRead, markRead } from "@/app/actions/notifications"
import type { InboxItem } from "@/lib/notifications/types"
import { SeverityBadge, relativeTime } from "./shared"
import { getKpi } from "@/lib/kpi-registry"

export function InboxPanel({ initialItems }: { initialItems: InboxItem[] }) {
  const [items, setItems] = useState<InboxItem[]>(initialItems)
  const [, startTransition] = useTransition()

  const unreadCount = items.filter((i) => i.status === "unread").length

  function handleMarkOne(deliveryId: string) {
    setItems((prev) => prev.map((i) => (i.deliveryId === deliveryId ? { ...i, status: "read" } : i)))
    startTransition(async () => {
      await markRead([deliveryId])
    })
  }

  function handleMarkAll() {
    setItems((prev) => prev.map((i) => ({ ...i, status: "read" })))
    startTransition(async () => {
      await markAllNotificationsRead()
    })
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-navy/20 bg-card px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Inbox className="size-6" />
        </span>
        <h2 className="mt-4 text-base font-semibold text-navy">No notifications yet</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          When a KPI you follow changes status, or the portfolio default band moves, you&apos;ll see it here. Use
          &ldquo;Check now&rdquo; above to run an evaluation.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-navy/15 bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-navy">
          {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          <span className="text-muted-foreground"> · {items.length} total</span>
        </p>
        {unreadCount > 0 ? (
          <Button variant="ghost" size="sm" onClick={handleMarkAll} className="gap-1.5">
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        ) : null}
      </div>

      <ul className="divide-y divide-border">
        {items.map((item) => {
          const kpi = item.event.kpiId ? getKpi(item.event.kpiId) : null
          const href = item.event.scope === "kpi" && kpi ? `/kpi/${kpi.id}` : "/"
          return (
            <li key={item.deliveryId} className={cn("flex gap-4 px-4 py-4", item.status === "unread" && "bg-muted/40")}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={item.event.severity} />
                  {item.status === "unread" ? (
                    <span className="size-2 rounded-full bg-aviation" aria-label="Unread" />
                  ) : null}
                  <span className="text-[11px] text-muted-foreground">{relativeTime(item.createdAt)}</span>
                </div>
                <p className="mt-1.5 text-sm font-semibold text-navy text-pretty">{item.event.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground text-pretty">{item.event.body}</p>
                <Link href={href} className="mt-1.5 inline-block text-xs font-medium text-aviation hover:underline">
                  {item.event.scope === "kpi" ? "View KPI dashboard" : "View Executive Summary"}
                </Link>
              </div>
              {item.status === "unread" ? (
                <button
                  type="button"
                  onClick={() => handleMarkOne(item.deliveryId)}
                  className="flex h-fit shrink-0 items-center gap-1 rounded-md border border-navy/15 px-2 py-1 text-xs font-medium text-navy transition-colors hover:bg-muted"
                >
                  <Check className="size-3.5" />
                  Read
                </button>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
