import type { ReactNode } from "react"
import { FileSpreadsheet } from "lucide-react"
import { KpiHeader } from "@/components/portal/kpi-chrome/kpi-header"
import type { KpiIcon } from "@/components/portal/kpi-chrome/kpi-stat-card"

/**
 * Standard KPI dashboard body used by every KPI. Renders the KPI-21 inline
 * header, an optional data-source line, the main content stack (gap-6), and an
 * optional footnote — all inside a centered max-w-6xl column.
 */
export function KpiPageShell({
  icon,
  label,
  title,
  description,
  actions,
  dataSource,
  footer,
  children,
}: {
  icon: KpiIcon
  label: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  /** Optional "Data source" caption shown under the header. */
  dataSource?: ReactNode
  /** Optional footnote rendered with a top border below the content. */
  footer?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="mx-auto max-w-6xl">
      <KpiHeader icon={icon} label={label} title={title} description={description} actions={actions} />

      {dataSource ? (
        <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <FileSpreadsheet className="size-3.5" aria-hidden />
          <span>{dataSource}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-6">{children}</div>

      {footer ? (
        <footer className="mt-10 border-t border-border pt-4 text-xs text-muted-foreground">{footer}</footer>
      ) : null}
    </div>
  )
}
