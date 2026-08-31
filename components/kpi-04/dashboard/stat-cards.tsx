import { Activity, CalendarCheck, Coins, TrendingDown } from "lucide-react"
import { KpiStatCard, KpiStatGrid } from "@/components/portal/kpi-chrome"

type StatCardsProps = {
  ytdEvents: number
  ytdDamagePoints: number
  compliantMonths: number
  months: number
  complianceRate: number
}

export function StatCards({
  ytdEvents,
  ytdDamagePoints,
  compliantMonths,
  months,
  complianceRate,
}: StatCardsProps) {
  return (
    <KpiStatGrid columns={4}>
      <KpiStatCard
        label="Events (12 mo)"
        value={ytdEvents}
        hint="Total unreported absent posts"
        icon={<Activity className="size-5" />}
        iconClassName="text-destructive"
      />
      <KpiStatCard
        label="Damage Points (12 mo)"
        value={ytdDamagePoints}
        hint="At 10 pts per event"
        icon={<Coins className="size-5" />}
        iconClassName="text-destructive"
      />
      <KpiStatCard
        label="Compliant Months"
        value={`${compliantMonths} / ${months}`}
        hint="Months meeting the zero target"
        icon={<CalendarCheck className="size-5" />}
      />
      <KpiStatCard
        label="Compliance Rate"
        value={`${complianceRate}%`}
        hint="Share of months at target"
        icon={<TrendingDown className="size-5" />}
        iconClassName="text-accent"
      />
    </KpiStatGrid>
  )
}
