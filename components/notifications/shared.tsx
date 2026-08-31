import { cn } from "@/lib/utils"
import type { Severity } from "@/lib/notifications/types"

/** Tailwind background token for each severity (uses the app's theme colors). */
const SEVERITY_BG: Record<Severity, string> = {
  info: "bg-aviation",
  warning: "bg-warning",
  critical: "bg-destructive",
}

const SEVERITY_LABEL: Record<Severity, string> = {
  info: "Info",
  warning: "Warning",
  critical: "Critical",
}

export function SeverityDot({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("size-2 shrink-0 rounded-full", SEVERITY_BG[severity], className)}
    />
  )
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        severity === "critical" && "bg-destructive/10 text-destructive",
        severity === "warning" && "bg-warning/15 text-warning-foreground",
        severity === "info" && "bg-aviation/10 text-aviation",
      )}
    >
      <span className={cn("size-1.5 rounded-full", SEVERITY_BG[severity])} aria-hidden="true" />
      {SEVERITY_LABEL[severity]}
    </span>
  )
}

/** Compact relative time, e.g. "3m ago", "2h ago", "Apr 3". */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.max(0, now - then)
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric" })
}
