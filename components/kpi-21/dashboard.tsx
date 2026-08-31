import { getKpi21Data } from "@/lib/kpi-21/get-data"
import { StaffingView } from "@/components/kpi-21/staffing-view"

/**
 * KPI-21 dashboard — the workbook is read and parsed on the server (SharePoint
 * or local fallback), matching every other KPI. The parsed weekly rows are
 * handed to the interactive client view so it renders immediately without a
 * client-side fetch or Excel parse on mount (the cause of the old perpetual
 * "Loading staffing data…" state). The upload-your-own-workbook feature is
 * preserved inside the client view.
 */
export async function Kpi21Dashboard() {
  let initialWeeks: Awaited<ReturnType<typeof getKpi21Data>>["weeks"] = []
  try {
    const data = await getKpi21Data()
    initialWeeks = data.weeks
  } catch {
    initialWeeks = []
  }

  return <StaffingView initialWeeks={initialWeeks} initialSource="Live SharePoint workbook" />
}
