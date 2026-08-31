"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { ChevronDown, Menu, UserRound, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { LogoutButton } from "@/components/portal/logout-button"
import type { CurrentUser } from "@/lib/notifications/types"

const NAV = [
  { label: "Executive Summary", href: "/" },
  { label: "KPIs", href: "/kpi/kpi-01" },
  { label: "Reports", href: "/reports" },
  { label: "Notifications", href: "/notifications" },
  { label: "Help & Manuals", href: "/help" },
]

const ROLE_LABEL: Record<string, string> = {
  viewer: "Viewer",
  manager: "Manager",
  admin: "Administrator",
}

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/"
  if (href.startsWith("/kpi")) return pathname.startsWith("/kpi")
  return pathname.startsWith(href)
}

export function SiteHeader({ user, showLogout }: { user: CurrentUser; showLogout?: boolean }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Close on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return
    function onPointer(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [menuOpen])

  // The sign-in screen has no app chrome (guard placed after all hooks).
  if (pathname === "/login") return null

  return (
    <header className="no-print sticky top-0 z-40 border-b border-navy/15 bg-card" ref={menuRef}>
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            <Image src="/cns-hiaa-logo.png" alt="CNS HIAA logo" width={36} height={36} className="object-contain" />
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-base font-bold tracking-tight text-navy">
              CNS <span className="text-aviation">HIAA</span>
            </span>
            <span className="truncate text-[11px] font-medium text-muted-foreground">Airport KPI Dashboard</span>
          </span>
        </Link>

        {/* Primary nav (desktop) */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => {
            const active = isActive(item.href, pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative py-5 text-sm font-medium transition-colors",
                  active ? "text-navy" : "text-muted-foreground hover:text-navy",
                )}
              >
                {item.label}
                {active ? (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-aviation" aria-hidden="true" />
                ) : null}
              </Link>
            )
          })}
        </nav>

        {/* User cluster */}
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Link
            href="/notifications"
            className="flex items-center gap-2 rounded-lg border border-navy/15 bg-card px-3 py-1.5 text-sm font-medium text-navy transition-colors hover:bg-muted"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-navy text-navy-foreground">
              <UserRound className="size-3.5" />
            </span>
            <span className="hidden flex-col items-start leading-tight sm:flex">
              <span>{user.displayName}</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                {ROLE_LABEL[user.role] ?? user.role}
              </span>
            </span>
            <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
          </Link>
          {showLogout ? <LogoutButton className="hidden sm:inline-flex" /> : null}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex size-9 items-center justify-center rounded-lg border border-navy/15 bg-card text-navy transition-colors hover:bg-muted md:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen ? (
        <nav id="mobile-nav" className="border-t border-border bg-card md:hidden">
          <ul className="mx-auto flex max-w-[1400px] flex-col px-4 py-2 sm:px-6">
            {NAV.map((item) => {
              const active = isActive(item.href, pathname)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                      active ? "bg-muted text-navy" : "text-muted-foreground hover:bg-muted hover:text-navy",
                    )}
                  >
                    {item.label}
                    {active ? <span className="size-1.5 rounded-full bg-aviation" aria-hidden="true" /> : null}
                  </Link>
                </li>
              )
            })}
            {showLogout ? (
              <li className="mt-1 border-t border-border pt-2">
                <LogoutButton className="w-full justify-start bg-transparent text-navy hover:bg-muted" />
              </li>
            ) : null}
          </ul>
        </nav>
      ) : null}
    </header>
  )
}
