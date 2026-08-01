import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/** Colored emphasis for a spec cell, mirroring the KPI-21 threshold styling. */
type SpecTone = "danger" | "warning" | "success" | "muted" | "plain"

const CELL_TONE: Record<SpecTone, string> = {
  danger: "bg-destructive/10 text-center font-semibold text-destructive",
  warning: "bg-warning/15 text-center font-semibold text-warning",
  success: "bg-success/10 text-center font-semibold text-success",
  muted: "text-muted-foreground",
  plain: "text-foreground",
}

export type KpiSpecCell = {
  content: ReactNode
  tone?: SpecTone
  colSpan?: number
  align?: "left" | "center"
}

export type KpiSpecRow = {
  /** Row header label shown in the left muted column. */
  label: string
  cells: KpiSpecCell[]
}

/**
 * The KPI-21 specification/threshold table: a primary code cell + secondary
 * title header, followed by definition rows. Each row is a labelled group of
 * cells that can carry colored thresholds (fail / target / success).
 */
export function KpiSpecTable({
  code,
  title,
  rows,
}: {
  code: string
  title: string
  rows: KpiSpecRow[]
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <tbody>
            <tr>
              <th
                scope="row"
                className="w-40 bg-primary px-4 py-3 text-left align-middle text-base font-bold text-primary-foreground"
              >
                {code}
              </th>
              <td colSpan={99} className="bg-secondary px-4 py-3 text-base font-semibold text-secondary-foreground">
                {title}
              </td>
            </tr>

            {rows.map((row) => (
              <tr key={row.label} className="border-t border-border">
                <th scope="row" className="bg-muted px-4 py-3 text-left align-top font-semibold text-foreground">
                  {row.label}
                </th>
                {row.cells.map((cell, i) => (
                  <td
                    key={i}
                    colSpan={cell.colSpan}
                    className={cn(
                      "px-4 py-3 leading-relaxed",
                      cell.align === "center" && "text-center",
                      CELL_TONE[cell.tone ?? "muted"],
                    )}
                  >
                    {cell.content}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
