// Client-safe module: types, KPI metadata, the raw-row mapper, and pure
// derivation helpers. No file/SharePoint access here so client components
// (e.g. the interactive events table) can import types/constants safely.
export type DistractionEvent = {
  id: string
  date: string
  shift: string
  post: string
  officer: string
  supervisor: string
  distractionType: string
  source: string
  severity: string
  verified: boolean
  notes: string
}

export type KpiMeta = {
  id: string
  name: string
  calculation: string
  thresholdFail: number
  thresholdTarget: number
  thresholdSuccess: string
  damagePointsPerEvent: number
  advantagePoints: string
}

export const kpi: KpiMeta = {
  id: "KPI-19",
  name: "On-Shift Distractions",
  calculation:
    "Any verified instance of an on-duty officer being distracted from post responsibilities (e.g. personal device use, unauthorized activity) counts as one (1) event.",
  thresholdFail: 1,
  thresholdTarget: 0,
  thresholdSuccess: "n/a",
  damagePointsPerEvent: 10,
  advantagePoints: "n/a",
}

export type RawKpi19Row = {
  "Event ID": string
  Date: string
  "Week Ending": string
  Shift: string
  "Post / Location": string
  Officer: string
  Supervisor: string
  "Distraction Type": string
  "Report Source": string
  Severity: string
  Verified: string
  "Damage Points": string | number
  Notes: string
}

export function mapEvents(rawRows: RawKpi19Row[]): DistractionEvent[] {
  return rawRows
    .map((r) => ({
      id: String(r["Event ID"]),
      date: String(r.Date).slice(0, 10),
      shift: String(r.Shift),
      post: String(r["Post / Location"]),
      officer: String(r.Officer),
      supervisor: String(r.Supervisor),
      distractionType: String(r["Distraction Type"]),
      source: String(r["Report Source"]),
      severity: String(r.Severity),
      verified: String(r.Verified).trim().toLowerCase() === "yes",
      notes: String(r.Notes),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function countBy<T>(items: T[], key: (item: T) => string) {
  const map = new Map<string, number>()
  for (const item of items) {
    const k = key(item)
    map.set(k, (map.get(k) ?? 0) + 1)
  }
  return map
}

export type Kpi19Summary = ReturnType<typeof getSummary>

export function getSummary(events: DistractionEvent[]) {
  const verified = events.filter((e) => e.verified)
  const totalEvents = verified.length
  const damagePoints = totalEvents * kpi.damagePointsPerEvent
  const pending = events.length - verified.length
  const status: "Fail" | "Target" = totalEvents >= kpi.thresholdFail ? "Fail" : "Target"

  const monthKeys = Array.from(new Set(verified.map((e) => e.date.slice(0, 7)))).sort()
  const latest = monthKeys[monthKeys.length - 1]
  const prev = monthKeys[monthKeys.length - 2]
  const latestCount = verified.filter((e) => e.date.startsWith(latest)).length
  const prevCount = prev ? verified.filter((e) => e.date.startsWith(prev)).length : 0
  const delta = latestCount - prevCount

  return {
    totalEvents,
    damagePoints,
    pending,
    status,
    latestCount,
    prevCount,
    delta,
    majorEvents: verified.filter((e) => e.severity === "Major").length,
  }
}

export function getMonthlyTrend(events: DistractionEvent[]) {
  const verified = events.filter((e) => e.verified)
  const byMonth = countBy(verified, (e) => e.date.slice(0, 7))
  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => {
      const [y, m] = month.split("-")
      return {
        month: `${MONTHS[Number(m) - 1]} ${y.slice(2)}`,
        events: count,
        damagePoints: count * kpi.damagePointsPerEvent,
        target: kpi.thresholdTarget,
      }
    })
}

export function getByPost(events: DistractionEvent[]) {
  const verified = events.filter((e) => e.verified)
  const byPost = countBy(verified, (e) => e.post)
  return Array.from(byPost.entries())
    .map(([post, count]) => ({ post, events: count }))
    .sort((a, b) => b.events - a.events)
}

export function getByType(events: DistractionEvent[]) {
  const verified = events.filter((e) => e.verified)
  const byType = countBy(verified, (e) => e.distractionType)
  return Array.from(byType.entries())
    .map(([type, count]) => ({ type, events: count }))
    .sort((a, b) => b.events - a.events)
}

export function getByOfficer(events: DistractionEvent[]) {
  const verified = events.filter((e) => e.verified)
  const byOfficer = countBy(verified, (e) => e.officer)
  return Array.from(byOfficer.entries())
    .map(([officer, count]) => ({ officer, events: count, damagePoints: count * kpi.damagePointsPerEvent }))
    .sort((a, b) => b.events - a.events)
}
