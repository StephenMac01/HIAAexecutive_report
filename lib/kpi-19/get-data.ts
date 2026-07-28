import "server-only"
import { getKpiSheetRows } from "@/lib/kpi-data/get-rows"
import {
  mapEvents,
  getSummary,
  getMonthlyTrend,
  getByPost,
  getByType,
  type DistractionEvent,
  type RawKpi19Row,
  type Kpi19Summary,
} from "./kpi-data"

export type Kpi19Data = {
  events: DistractionEvent[]
  summary: Kpi19Summary
  trend: ReturnType<typeof getMonthlyTrend>
  byPost: ReturnType<typeof getByPost>
  byType: ReturnType<typeof getByType>
}

export async function getKpi19Data(): Promise<Kpi19Data> {
  const rows = await getKpiSheetRows<RawKpi19Row>("kpi-19", "Events Log")
  const events = mapEvents(rows)
  return {
    events,
    summary: getSummary(events),
    trend: getMonthlyTrend(events),
    byPost: getByPost(events),
    byType: getByType(events),
  }
}
