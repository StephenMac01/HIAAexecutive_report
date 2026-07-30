import "server-only";
import { getKpiSheetRows } from "@/lib/kpi-data/get-rows";
import {
  kpiMeta,
  type EventSource,
  type IncidentCategory,
  type Kpi01CategoryDatum,
  type Kpi01Data,
  type Kpi01SourceDatum,
  type Kpi01Summary,
  type Kpi01TimelineDatum,
  type KpiEvent,
} from "@/lib/kpi-01/kpi-data";

// KPI-01 is powered live by the Excel workbook at data/kpi-01/kpi-01.xlsx
// (Data sheet), sourced from SharePoint in production. The derivations below
// run on every request (ISR-cached) against the current rows.
type RawKpi01Row = {
  "Event ID": string;
  Date: string;
  Source: string;
  Location: string;
  Category: string;
  Substantiated: string;
  Treatment: string;
  "Damage Points": string | number;
};

const CATEGORY_ORDER: IncidentCategory[] = [
  "Inaccurate Information",
  "Lack of Professionalism",
  "Unsafe Behaviour",
  "Refusal of Service",
  "Destructive Behaviour",
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function countBy<T extends string>(items: T[]): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, key) => {
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

/** Load the live KPI-01 workbook rows and compute every derived structure. */
export async function getKpi01Data(): Promise<Kpi01Data> {
  const rawRows = await getKpiSheetRows<RawKpi01Row>("kpi-01", "Data");

  const events: KpiEvent[] = rawRows.map((r) => ({
    id: String(r["Event ID"]),
    date: String(r.Date).slice(0, 10),
    source: r.Source as EventSource,
    location: String(r.Location),
    category: r.Category as IncidentCategory,
    substantiated: String(r.Substantiated).trim().toLowerCase() === "yes",
    treatment:
      String(r.Treatment).trim() === "Included" ? "Included" : "Excluded",
    damagePoints: Number(r["Damage Points"]) || 0,
  }));

  const substantiatedEvents = events.filter((e) => e.substantiated);
  // KPI counts substantiated material events treated as "Included".
  const countedEvents = events.filter(
    (e) => e.substantiated && e.treatment === "Included",
  );

  const summary: Kpi01Summary = {
    totalRecords: events.length,
    substantiated: substantiatedEvents.length,
    excluded: events.filter((e) => e.treatment === "Excluded").length,
    counted: countedEvents.length,
    totalDamagePoints: events.reduce((sum, e) => sum + e.damagePoints, 0),
    result: countedEvents.length >= kpiMeta.failThreshold ? "FAIL" : "PASS",
  };

  const categoryBreakdown: Kpi01CategoryDatum[] = CATEGORY_ORDER.map(
    (category) => {
      const inCategory = events.filter((e) => e.category === category);
      return {
        category,
        short: category
          .split(" ")
          .map((w) => w[0])
          .join(""),
        counted: inCategory.filter(
          (e) => e.substantiated && e.treatment === "Included",
        ).length,
        excluded: inCategory.filter(
          (e) => !(e.substantiated && e.treatment === "Included"),
        ).length,
        total: inCategory.length,
      };
    },
  ).filter((c) => c.total > 0);

  const sourceBreakdown: Kpi01SourceDatum[] = Object.entries(
    countBy(events.map((e) => e.source)),
  ).map(([source, total]) => {
    const counted = events.filter(
      (e) =>
        e.source === source && e.substantiated && e.treatment === "Included",
    ).length;
    return { source, total, counted };
  });

  // Cumulative counted events and damage points across the reporting year.
  const cumulativeTimeline: Kpi01TimelineDatum[] = (() => {
    const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
    let runningCounted = 0;
    let runningPoints = 0;
    const perMonth = new Map<number, { counted: number; points: number }>();

    for (const e of sorted) {
      const month = new Date(e.date).getUTCMonth();
      const isCounted = e.substantiated && e.treatment === "Included";
      runningCounted += isCounted ? 1 : 0;
      runningPoints += e.damagePoints;
      perMonth.set(month, { counted: runningCounted, points: runningPoints });
    }

    let lastCounted = 0;
    let lastPoints = 0;
    return MONTHS.slice(0, 8).map((label, idx) => {
      if (perMonth.has(idx)) {
        const v = perMonth.get(idx)!;
        lastCounted = v.counted;
        lastPoints = v.points;
      }
      return {
        month: label,
        counted: lastCounted,
        points: lastPoints,
        threshold: kpiMeta.failThreshold,
      };
    });
  })();

  return {
    events,
    summary,
    categoryBreakdown,
    sourceBreakdown,
    cumulativeTimeline,
  };
}
