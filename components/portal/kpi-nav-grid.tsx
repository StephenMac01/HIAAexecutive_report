"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { KPIS } from "@/lib/kpi-registry"
import { cn } from "@/lib/utils"

export function KpiNavGrid() {
  const params = useParams<{ id?: string }>()
  const activeId = params?.id ?? "kpi-01"

  return (
    <nav aria-label="KPI selector" className="rounded-2xl border border-navy/10 bg-card p-3 shadow-sm sm:p-4">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {KPIS.map((kpi) => {
          const active = kpi.id === activeId
          return (
            <li key={kpi.id}>
              <Link
                href={`/kpi/${kpi.id}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center justify-center rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "border-navy bg-navy text-navy-foreground shadow-sm"
                    : "border-navy/15 bg-card text-navy hover:border-navy/40 hover:bg-muted",
                  !kpi.available && !active && "text-navy/45",
                )}
              >
                {kpi.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
