import { Award, MessageSquareHeart, Target, XCircle } from "lucide-react"
import { KpiStatCard, KpiStatGrid } from "@/components/portal/kpi-chrome"
import { KPI02, type Kpi02Summary } from "@/lib/kpi-02/kpi-data"

export function Kpi02Stats({ summary }: { summary: Kpi02Summary }) {
  return (
    <KpiStatGrid columns={4}>
      <KpiStatCard
        label="Counted compliments"
        value={summary.totalCounted.toString()}
        hint="Valid events (solicited excluded)"
        icon={<MessageSquareHeart className="size-5" />}
        iconClassName="text-primary"
      />
      <KpiStatCard
        label="Advantage points"
        value={`${summary.totalAdvantagePoints}`}
        hint={`Max ${KPI02.advantagePointsMax}/period`}
        icon={<Award className="size-5" />}
        iconClassName="text-success"
      />
      <KpiStatCard
        label="Periods meeting target"
        value={`${summary.monthsMeetingTarget}/${summary.totalMonths}`}
        hint={`Target ≥ ${KPI02.target} per period`}
        icon={<Target className="size-5" />}
      />
      <KpiStatCard
        label="Solicited (excluded)"
        value={summary.totalSolicitedExcluded.toString()}
        hint="Not counted per calculation"
        icon={<XCircle className="size-5" />}
      />
    </KpiStatGrid>
  )
}
