import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Layers,
  Minus,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiStatCard, KpiStatGrid, KpiStatusBadge, type KpiTone } from "@/components/portal/kpi-chrome"
import { getExecutiveSummary } from "@/lib/executive-summary/aggregate"
import type { DefaultBand } from "@/lib/executive-summary/types"
import { KpiGrid } from "./kpi-grid"
import { DefaultGauge } from "./default-gauge"
import { TransitionWidget } from "./transition-widget"
import { PortfolioTrendCharts } from "./trend-charts"
import { PrintToolbar } from "./print-toolbar"

const BAND_TONE: Record<DefaultBand, KpiTone> = {
  green: "success",
  yellow: "warning",
  orange: "warning",
  red: "danger",
}

const BAND_HEADLINE: Record<DefaultBand, string> = {
  green: "Contract Compliant",
  yellow: "Monitoring — Within Tolerance",
  orange: "Elevated Damage Points",
  red: "Event of Default Threshold Reached",
}

export async function ExecutiveSummaryDashboard() {
  const s = await getExecutiveSummary()

  const breaches = s.contributions.filter((c) => c.status === "red").length
  const atRisk = s.contributions.filter((c) => c.status === "amber").length
  const onTarget = s.contributions.filter((c) => c.status === "green").length

  return (
    <div className="flex flex-col gap-6">
      <PrintToolbar
        reportingMonth={s.reportingMonth}
        kpisReported={s.kpisReported}
        kpisTotal={s.kpisTotal}
        statusHeadline={BAND_HEADLINE[s.defaultBand]}
      />

      {/* Contract status banner */}
      <Card className="report-section overflow-hidden border-navy/10">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-aviation/10 text-aviation"
              aria-hidden
            >
              {s.defaultBand === "green" ? (
                <CheckCircle2 className="size-6" />
              ) : s.defaultBand === "red" ? (
                <ShieldAlert className="size-6 text-destructive" />
              ) : (
                <AlertTriangle className="size-6 text-warning" />
              )}
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-navy">Schedule &quot;D&quot; Performance Summary</h2>
                <KpiStatusBadge tone={BAND_TONE[s.defaultBand]}>{BAND_HEADLINE[s.defaultBand]}</KpiStatusBadge>
              </div>
              <p className="text-sm text-muted-foreground">
                Reporting month <span className="font-medium text-foreground">{s.reportingMonth}</span> ·{" "}
                {s.kpisReported} of {s.kpisTotal} KPIs reporting live data
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold tabular-nums text-foreground">{s.rollingSixMonthDamage}</div>
              <div className="text-xs text-muted-foreground">Rolling 6-mo damage</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold tabular-nums text-destructive">{s.defaultThreshold}</div>
              <div className="text-xs text-muted-foreground">Default threshold</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary stat cards */}
      <div className="report-section flex flex-col gap-6">
      <KpiStatGrid columns={4} className="print:grid-cols-4">
        <KpiStatCard
          label="Monthly Damage Points"
          value={s.monthlyDamagePoints}
          icon={<TrendingDown />}
          iconClassName="text-destructive"
          hint={`${s.reportingMonth}`}
        />
        <KpiStatCard
          label="Monthly Advantage Points"
          value={s.monthlyAdvantagePoints}
          icon={<TrendingUp />}
          iconClassName="text-success"
          hint="Credits earned this month"
        />
        <KpiStatCard
          label="Net Monthly Damage"
          value={s.netMonthlyDamagePoints}
          icon={<Minus />}
          hint="Damage − Advantage"
          valueClassName={s.netMonthlyDamagePoints > 0 ? "text-destructive" : "text-success"}
        />
        <KpiStatCard
          label="Rolling 6-Month Total"
          value={s.rollingSixMonthDamage}
          icon={<Layers />}
          iconClassName="text-aviation"
          hint={`${Math.max(0, s.defaultThreshold - s.rollingSixMonthDamage)} pts to default`}
        />
      </KpiStatGrid>

      <KpiStatGrid columns={4} className="print:grid-cols-4">
        <KpiStatCard label="KPIs On Target" value={onTarget} icon={<CheckCircle2 />} iconClassName="text-success" />
        <KpiStatCard label="KPIs At Risk" value={atRisk} icon={<AlertTriangle />} iconClassName="text-warning" />
        <KpiStatCard label="KPIs In Breach" value={breaches} icon={<ShieldAlert />} iconClassName="text-destructive" />
        <KpiStatCard label="KPIs Tracked" value={s.kpisTotal} icon={<ClipboardList />} iconClassName="text-aviation" />
      </KpiStatGrid>
      </div>

      {/* Gauge + transition + monthly formula */}
      <div className="report-section grid grid-cols-1 gap-4 lg:grid-cols-3 print:grid-cols-3">
        <div className="lg:col-span-2">
          <DefaultGauge value={s.rollingSixMonthDamage} threshold={s.defaultThreshold} band={s.defaultBand} />
        </div>
        <TransitionWidget transition={s.transition} />
      </div>

      <MonthlyFormula
        damage={s.monthlyDamagePoints}
        advantage={s.monthlyAdvantagePoints}
        net={s.netMonthlyDamagePoints}
        month={s.reportingMonth}
      />

      {/* Trend charts */}
      <div className="report-page-break">
        <PortfolioTrendCharts
          portfolioMonthly={s.portfolioMonthly}
          rollingWindow={s.rollingWindow}
          contributions={s.contributions}
          defaultThreshold={s.defaultThreshold}
        />
      </div>

      {/* Per-KPI grid */}
      <div className="report-page-break flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-navy">KPI Register</h3>
          <span className="text-sm text-muted-foreground">— all 21 Schedule &quot;D&quot; indicators</span>
        </div>
        <KpiGrid contributions={s.contributions} />
      </div>

      {/* Contract rules */}
      <div className="report-section">
        <RulesPanel rules={s.rules} />
      </div>
    </div>
  )
}

function MonthlyFormula({
  damage,
  advantage,
  net,
  month,
}: {
  damage: number
  advantage: number
  net: number
  month: string
}) {
  return (
    <Card className="report-section border-navy/10">
      <CardHeader>
        <CardTitle className="text-base text-navy">Monthly Points Reconciliation — {month}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3 text-center">
          <FormulaChip label="Damage Points" value={damage} tone="danger" />
          <span className="text-2xl font-light text-muted-foreground">−</span>
          <FormulaChip label="Advantage Points" value={advantage} tone="success" />
          <span className="text-2xl font-light text-muted-foreground">=</span>
          <FormulaChip label="Net Damage Points" value={net} tone={net > 0 ? "danger" : "success"} emphasize />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Advantage points earned in a month offset damage points before the net figure is added to the rolling
          6-month default calculation, per Schedule &quot;D&quot;.
        </p>
      </CardContent>
    </Card>
  )
}

function FormulaChip({
  label,
  value,
  tone,
  emphasize,
}: {
  label: string
  value: number
  tone: "danger" | "success"
  emphasize?: boolean
}) {
  const color = tone === "danger" ? "text-destructive" : "text-success"
  return (
    <div
      className={
        emphasize
          ? "flex flex-col rounded-xl border border-navy/15 bg-muted/50 px-5 py-3"
          : "flex flex-col rounded-xl border border-border px-5 py-3"
      }
    >
      <span className={`text-2xl font-bold tabular-nums ${color}`}>{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function RulesPanel({ rules }: { rules: string[] }) {
  return (
    <Card className="border-navy/10">
      <CardHeader>
        <CardTitle className="text-base text-navy">Schedule &quot;D&quot; Contract Rules</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {rules.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-aviation" aria-hidden />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
