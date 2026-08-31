"use client"

import { useMemo, useState, useTransition } from "react"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { KPIS } from "@/lib/kpi-registry"
import { saveKpiSubscription, savePortfolioSubscription } from "@/app/actions/notifications"
import type { Severity } from "@/lib/notifications/types"

export type ChannelPref = { dashboard: boolean; email: boolean; teams: boolean; minSeverity: Severity }
export type KpiPref = ChannelPref & { kpiId: string }

const EMAIL_ENABLED = process.env.NEXT_PUBLIC_NOTIFICATIONS_EMAIL_ENABLED === "true"
const TEAMS_ENABLED = process.env.NEXT_PUBLIC_NOTIFICATIONS_TEAMS_ENABLED === "true"

const DEFAULT_PREF: ChannelPref = { dashboard: false, email: false, teams: false, minSeverity: "warning" }

export function SubscriptionsPanel({ portfolio, kpiPrefs }: { portfolio: ChannelPref | null; kpiPrefs: KpiPref[] }) {
  const initialKpiMap = useMemo(() => {
    const map: Record<string, ChannelPref> = {}
    for (const k of kpiPrefs) map[k.kpiId] = { dashboard: k.dashboard, email: k.email, teams: k.teams, minSeverity: k.minSeverity }
    return map
  }, [kpiPrefs])

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Choose which alerts reach you and how. Dashboard delivery is available now; email and Microsoft Teams turn on
        once the organization enables those channels.
      </p>

      {/* Portfolio-level */}
      <section className="rounded-xl border border-navy/15 bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-navy">Portfolio</h2>
          <p className="text-xs text-muted-foreground">Event-of-Default band changes across all KPIs.</p>
        </div>
        <div className="px-4 py-3">
          <SubscriptionRow
            label="Overall portfolio status"
            sublabel="Rolling 6-month default band"
            scope="portfolio"
            initial={portfolio ?? DEFAULT_PREF}
          />
        </div>
      </section>

      {/* Per-KPI */}
      <section className="rounded-xl border border-navy/15 bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-navy">Individual KPIs</h2>
          <p className="text-xs text-muted-foreground">
            Follow specific KPIs to be alerted when their monthly status changes.
          </p>
        </div>
        <div className="divide-y divide-border">
          {KPIS.map((kpi) => (
            <div key={kpi.id} className="px-4 py-3">
              <SubscriptionRow
                label={kpi.label}
                sublabel={kpi.title === `${kpi.label} Dashboard` ? undefined : kpi.title}
                scope="kpi"
                kpiId={kpi.id}
                initial={initialKpiMap[kpi.id] ?? DEFAULT_PREF}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function SubscriptionRow({
  label,
  sublabel,
  scope,
  kpiId,
  initial,
}: {
  label: string
  sublabel?: string
  scope: "kpi" | "portfolio"
  kpiId?: string
  initial: ChannelPref
}) {
  const [pref, setPref] = useState<ChannelPref>(initial)
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function persist(next: ChannelPref) {
    setPref(next)
    setSaved(false)
    startTransition(async () => {
      if (scope === "portfolio") await savePortfolioSubscription(next)
      else if (kpiId) await saveKpiSubscription(kpiId, next)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    })
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-navy">{label}</p>
        {sublabel ? <p className="truncate text-xs text-muted-foreground">{sublabel}</p> : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ChannelToggle
          label="Dashboard"
          active={pref.dashboard}
          onClick={() => persist({ ...pref, dashboard: !pref.dashboard })}
        />
        <ChannelToggle
          label="Email"
          active={pref.email}
          disabled={!EMAIL_ENABLED}
          onClick={() => persist({ ...pref, email: !pref.email })}
        />
        <ChannelToggle
          label="Teams"
          active={pref.teams}
          disabled={!TEAMS_ENABLED}
          onClick={() => persist({ ...pref, teams: !pref.teams })}
        />

        <Select value={pref.minSeverity} onValueChange={(v) => persist({ ...pref, minSeverity: v as Severity })}>
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Info & up</SelectItem>
            <SelectItem value="warning">Warning & up</SelectItem>
            <SelectItem value="critical">Critical only</SelectItem>
          </SelectContent>
        </Select>

        <span className="flex w-5 justify-center">
          {pending ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : saved ? (
            <Check className="size-4 text-success" />
          ) : null}
        </span>
      </div>
    </div>
  )
}

function ChannelToggle({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string
  active: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? `${label} delivery is not enabled yet` : undefined}
      aria-pressed={active}
      className={cn(
        "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
        disabled
          ? "cursor-not-allowed border-border bg-muted/50 text-muted-foreground/50"
          : active
            ? "border-aviation bg-aviation text-aviation-foreground"
            : "border-navy/15 bg-card text-navy hover:bg-muted",
      )}
    >
      {label}
    </button>
  )
}
