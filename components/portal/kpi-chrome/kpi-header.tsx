import type { ReactNode } from "react"
import { renderKpiIcon, type KpiIcon } from "@/components/portal/kpi-chrome/kpi-stat-card"

/**
 * The signature KPI-21 inline header: a primary icon badge, an uppercase KPI
 * code, a bold title, a supporting description, and an optional actions slot
 * (e.g. Upload / Refresh controls) on the right.
 *
 * `icon` is a rendered element (`<Plane className="size-5" />`); the badge
 * forces it to 24px so the chrome stays consistent across every KPI.
 */
export function KpiHeader({
  icon,
  label,
  title,
  description,
  actions,
}: {
  icon: KpiIcon
  label: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground [&_svg]:size-6">
          {renderKpiIcon(icon)}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{label}</p>
          <h1 className="text-balance text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-pretty text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}
