import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Shared status pill used across every KPI dashboard.
 * Generalized from the KPI-21 design (success / target / fail) into reusable tones.
 */
export type KpiTone = "success" | "warning" | "danger" | "info" | "neutral"

const TONE_CLASSES: Record<KpiTone, string> = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/40",
  danger: "bg-destructive/15 text-destructive border-destructive/30",
  info: "bg-aviation/10 text-aviation border-aviation/30",
  neutral: "bg-muted text-muted-foreground border-border",
}

export function KpiStatusBadge({
  tone = "neutral",
  children,
  className,
  dot = true,
}: {
  tone?: KpiTone
  children: ReactNode
  className?: string
  /** Render the leading status dot. Defaults to true. */
  dot?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </span>
  )
}
