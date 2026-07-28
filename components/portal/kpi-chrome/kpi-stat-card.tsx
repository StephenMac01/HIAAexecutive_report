import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * Icon prop. Always a rendered node (e.g. `<Plane className="size-5" />`) so it
 * serializes safely across Server/Client component boundaries — never pass a
 * bare component reference.
 */
export type KpiIcon = ReactNode

export function renderKpiIcon(icon: KpiIcon): ReactNode {
  if (icon == null || typeof icon === "boolean") return null
  return icon
}

/**
 * Responsive grid wrapper for KPI stat cards. Defaults to the KPI-21 layout
 * (1 → 2 → 4 columns). Accepts `columns` or the alias `cols`, and forwards any
 * extra div props (e.g. `aria-label`).
 */
export function KpiStatGrid({
  children,
  columns,
  cols,
  className,
  ...rest
}: {
  children: ReactNode
  columns?: 2 | 3 | 4 | 5 | 6
  cols?: 2 | 3 | 4 | 5 | 6
  className?: string
} & Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "children">) {
  const count = columns ?? cols ?? 4
  const colClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
    5: "sm:grid-cols-2 lg:grid-cols-5",
    6: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
  }[count]

  return (
    <div className={cn("grid grid-cols-1 gap-4", colClass, className)} {...rest}>
      {children}
    </div>
  )
}

/**
 * Single stat card matching the KPI-21 summary-card design: a muted label with
 * an optional icon, a large tabular value, and a supporting hint line. Pass
 * `children` to render fully custom content (e.g. a status breakdown list) in
 * place of the value + hint.
 */
export function KpiStatCard({
  label,
  value,
  icon,
  iconClassName,
  hint,
  valueClassName,
  children,
}: {
  label: ReactNode
  value?: ReactNode
  /** Icon component or element, e.g. `Users` or `<Users className="size-5" />`. */
  icon?: KpiIcon
  iconClassName?: string
  hint?: ReactNode
  valueClassName?: string
  children?: ReactNode
}) {
  const iconNode = icon ? renderKpiIcon(icon) : null
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          {iconNode ? (
            <span className={cn("text-muted-foreground [&_svg]:size-4", iconClassName)} aria-hidden>
              {iconNode}
            </span>
          ) : null}
        </div>
        {children ? (
          children
        ) : (
          <>
            <span className={cn("text-3xl font-bold tabular-nums text-foreground", valueClassName)}>{value}</span>
            {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}
