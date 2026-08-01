import { KpiStatusBadge, type KpiTone } from "@/components/portal/kpi-chrome"
import { STATUS_META, type KpiStatus } from "@/lib/kpi-21/kpi"

const STATUS_TONE: Record<KpiStatus, KpiTone> = {
  success: "success",
  target: "warning",
  fail: "danger",
}

export function StatusBadge({ status, className }: { status: KpiStatus; className?: string }) {
  return (
    <KpiStatusBadge tone={STATUS_TONE[status]} className={className}>
      {STATUS_META[status].label}
    </KpiStatusBadge>
  )
}
