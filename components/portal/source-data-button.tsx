import { Download } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * The single, canonical "download the source workbook" control used across the
 * entire portal. Every KPI dashboard and the Reports view render THIS component
 * so the label, icon, and styling stay identical everywhere.
 *
 * Streams the live workbook from `/api/kpi/{id}/xlsx`, which serves the current
 * bytes from SharePoint (or local fallback) — never a stale static mirror.
 */
export function SourceDataButton({
  kpiId,
  className,
}: {
  /** KPI id, e.g. "kpi-07" */
  kpiId: string
  className?: string
}) {
  return (
    <a
      href={`/api/kpi/${kpiId}/xlsx`}
      download={`${kpiId}.xlsx`}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-lg border border-navy/15 bg-card px-3.5 py-2 text-sm font-semibold text-navy shadow-sm transition-colors hover:bg-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aviation focus-visible:ring-offset-2",
        className,
      )}
    >
      <Download className="size-4" aria-hidden="true" />
      Download Source Data (.xlsx)
    </a>
  )
}
