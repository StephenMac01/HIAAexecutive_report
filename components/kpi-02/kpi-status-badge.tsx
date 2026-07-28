import { KpiStatusBadge as SharedStatusBadge, type KpiTone } from "@/components/portal/kpi-chrome"
import type { KpiStatus } from "@/lib/kpi-02/kpi-data"

const STATUS_CONFIG: Record<KpiStatus, { label: string; tone: KpiTone }> = {
  success: { label: "Success", tone: "success" },
  "on-target": { label: "On target", tone: "info" },
  "at-risk": { label: "At risk", tone: "warning" },
  fail: { label: "Fail", tone: "danger" },
}

export function KpiStatusBadge({ status }: { status: KpiStatus }) {
  const cfg = STATUS_CONFIG[status]
  return <SharedStatusBadge tone={cfg.tone}>{cfg.label}</SharedStatusBadge>
}
