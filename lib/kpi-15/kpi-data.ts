export const DAMAGE_POINTS_PER_EVENT = 10
export const FAIL_THRESHOLD = 1
export const TARGET = 0

export type EventType = "Missing Requirement" | "Removed Without Replacement"
export type EventStatus = "Open" | "Resolved"

export interface VehicleEvent {
  eventId: string
  weekEnding: string
  date: string
  vehicleId: string
  eventType: EventType
  description: string
  location: string
  reportedBy: string
  status: EventStatus
  damagePoints: number
}

export type FleetStatus = "Compliant" | "Non-Compliant" | "Removed"

export interface FleetVehicle {
  vehicleId: string
  type: string
  makeModel: string
  year: number
  status: FleetStatus
  lastInspection: string
}

export interface WeeklyPoint {
  weekEnding: string
  label: string
  events: number
  damagePoints: number
  target: number
  fail: number
}

export interface KpiData {
  events: VehicleEvent[]
  fleet: FleetVehicle[]
  weekly: WeeklyPoint[]
  totals: {
    events: number
    damagePoints: number
    openEvents: number
    missingRequirement: number
    removedWithoutReplacement: number
    currentPeriodEvents: number
    currentPeriodLabel: string
    currentPeriodStatus: "Pass" | "Fail"
  }
  fleetStats: {
    total: number
    compliant: number
    nonCompliant: number
    removed: number
    complianceRate: number
  }
  breakdown: { name: EventType; value: number }[]
}

