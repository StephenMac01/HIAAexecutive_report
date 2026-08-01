export type KpiEntry = {
  /** Route slug, e.g. "kpi-01" */
  id: string
  /** Short label shown on the nav button, e.g. "KPI-01" */
  label: string
  /** Human-readable dashboard title */
  title: string
  /** Whether a full dashboard has been built for this KPI */
  available: boolean
}

/**
 * The full CNS HIAA KPI catalogue (KPI-01 through KPI-21).
 * KPI-01..KPI-13 have complete dashboards; the remainder are placeholders.
 */
export const KPIS: KpiEntry[] = [
  { id: "kpi-01", label: "KPI-01", title: "KPI-01 Dashboard", available: true },
  { id: "kpi-02", label: "KPI-02", title: "KPI-02 Dashboard", available: true },
  { id: "kpi-03", label: "KPI-03", title: "KPI-03 Dashboard", available: true },
  { id: "kpi-04", label: "KPI-04", title: "KPI-04 Dashboard", available: true },
  { id: "kpi-05", label: "KPI-05", title: "KPI-05 Dashboard", available: true },
  { id: "kpi-06", label: "KPI-06", title: "KPI-06 Dashboard", available: true },
  { id: "kpi-07", label: "KPI-07", title: "KPI-07 Dashboard", available: true },
  { id: "kpi-08", label: "KPI-08", title: "KPI-08 Dashboard", available: true },
  { id: "kpi-09", label: "KPI-09", title: "KPI-09 Dashboard", available: true },
  { id: "kpi-10", label: "KPI-10", title: "KPI-10 Dashboard", available: true },
  { id: "kpi-11", label: "KPI-11", title: "KPI-11 Dashboard", available: true },
  { id: "kpi-12", label: "KPI-12", title: "KPI-12 Dashboard", available: true },
  { id: "kpi-13", label: "KPI-13", title: "KPI-13 Dashboard", available: true },
  { id: "kpi-14", label: "KPI-14", title: "KPI-14 Dashboard", available: true },
  { id: "kpi-15", label: "KPI-15", title: "KPI-15 Dashboard", available: true },
  { id: "kpi-16", label: "KPI-16", title: "KPI-16 Dashboard", available: true },
  { id: "kpi-17", label: "KPI-17", title: "KPI-17 Dashboard", available: true },
  { id: "kpi-18", label: "KPI-18", title: "KPI-18 Dashboard", available: true },
  { id: "kpi-19", label: "KPI-19", title: "KPI-19 Dashboard", available: true },
  { id: "kpi-20", label: "KPI-20", title: "KPI-20 Dashboard", available: true },
  { id: "kpi-21", label: "KPI-21", title: "KPI-21 Dashboard", available: true },
]

export function getKpi(id: string): KpiEntry | undefined {
  return KPIS.find((k) => k.id === id)
}
