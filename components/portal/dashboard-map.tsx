import type { ReactNode } from "react"
import { Kpi01Dashboard } from "@/components/kpi-01/dashboard"
import { Kpi02Dashboard } from "@/components/kpi-02/dashboard"
import { Kpi03Dashboard } from "@/components/kpi-03/dashboard"
import { Kpi04Dashboard } from "@/components/kpi-04/dashboard"
import { Kpi05Dashboard } from "@/components/kpi-05/dashboard"
import { Kpi06Dashboard } from "@/components/kpi-06/dashboard"
import { Kpi07Dashboard } from "@/components/kpi-07/dashboard"
import { Kpi08Dashboard } from "@/components/kpi-08/dashboard"
import { Kpi09Dashboard } from "@/components/kpi-09/dashboard"
import { Kpi10Dashboard } from "@/components/kpi-10/dashboard"
import { Kpi11Dashboard } from "@/components/kpi-11/dashboard"
import { Kpi12Dashboard } from "@/components/kpi-12/dashboard"
import { Kpi13Dashboard } from "@/components/kpi-13/dashboard"
import { Kpi14Dashboard } from "@/components/kpi-14/dashboard"
import { Kpi15Dashboard } from "@/components/kpi-15/dashboard"
import { Kpi16Dashboard } from "@/components/kpi-16/dashboard"
import { Kpi17Dashboard } from "@/components/kpi-17/dashboard"
import { Kpi18Dashboard } from "@/components/kpi-18/dashboard"
import { Kpi19Dashboard } from "@/components/kpi-19/dashboard"
import { Kpi20Dashboard } from "@/components/kpi-20/dashboard"
import { Kpi21Dashboard } from "@/components/kpi-21/dashboard"

// Dashboards are server components; most are async because they read their
// live Excel workbook. This type admits both sync and async components.
type DashboardComponent = () => ReactNode | Promise<ReactNode>

export const DASHBOARDS: Record<string, DashboardComponent | undefined> = {
  "kpi-01": Kpi01Dashboard,
  "kpi-02": Kpi02Dashboard,
  "kpi-03": Kpi03Dashboard,
  "kpi-04": Kpi04Dashboard,
  "kpi-05": Kpi05Dashboard,
  "kpi-06": Kpi06Dashboard,
  "kpi-07": Kpi07Dashboard,
  "kpi-08": Kpi08Dashboard,
  "kpi-09": Kpi09Dashboard,
  "kpi-10": Kpi10Dashboard,
  "kpi-11": Kpi11Dashboard,
  "kpi-12": Kpi12Dashboard,
  "kpi-13": Kpi13Dashboard,
  "kpi-14": Kpi14Dashboard,
  "kpi-15": Kpi15Dashboard,
  "kpi-16": Kpi16Dashboard,
  "kpi-17": Kpi17Dashboard,
  "kpi-18": Kpi18Dashboard,
  "kpi-19": Kpi19Dashboard,
  "kpi-20": Kpi20Dashboard,
  "kpi-21": Kpi21Dashboard,
}
