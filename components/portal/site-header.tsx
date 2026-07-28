"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, LogOut, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { label: "Executive Summary", href: "/" },
  { label: "KPIs", href: "/kpi/kpi-01" },
  { label: "Reports", href: "/reports" },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="no-print sticky top-0 z-40 border-b border-navy/15 bg-card">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            <Image src="/cns-hiaa-logo.png" alt="CNS HIAA logo" width={36} height={36} className="object-contain" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight text-navy">
              CNS <span className="text-aviation-blue">HIAA</span>
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">Airport KPI Dashboard</span>
          </span>
        </Link>

        {/* Primary nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : item.href.startsWith("/kpi")
                  ? pathname.startsWith("/kpi")
                  : pathname.startsWith(item.href)
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
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-navy/15 bg-card px-3 py-1.5 text-sm font-medium text-navy transition-colors hover:bg-muted"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-navy text-navy-foreground">
              <UserRound className="size-3.5" />
            </span>
            <span className="hidden sm:inline">Stephen MacNeil</span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-navy-foreground transition-colors hover:bg-navy/90"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
