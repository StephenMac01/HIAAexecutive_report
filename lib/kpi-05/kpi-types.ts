// Client-safe types shared between the server data layer and client chart
// components. This file must NOT import any Node-only modules (fs, path, xlsx),
// so it can be bundled for the browser.

export type EventType = "Untrained working" | "Unqualified filling post"

export type KpiEvent = {
  id: string
  date: string // ISO date
  type: EventType
  unit: string
  personnel: string
  post: string
}

export type MonthlyPoint = {
  month: string
  untrained: number
  unqualified: number
  events: number
  damage: number
  cumulativeDamage: number
}

export type TypeSlice = { type: EventType; key: string; count: number }

export type UnitSlice = { unit: string; count: number; damage: number }

export type KpiSummary = {
  totalEvents: number
  damagePoints: number
  target: number
  status: "Fail" | "Target met"
  currentMonthEvents: number
  previousMonthEvents: number
  daysSinceLastEvent: number
  worstUnit: string
}
