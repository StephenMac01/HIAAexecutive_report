// Generates one dedicated flat-file workbook per KPI:
//   data/kpi-NN/kpi-NN.xlsx
//
// Each workbook has:
//   • a primary "records" sheet normalized to exactly 25 data rows
//   • any secondary reference sheets the dashboard needs (copied verbatim)
//   • a "Summary" sheet with LIVE Excel formulas that recalculate the KPI
//     headline metrics from the records sheet.
//
// The 8 KPIs that already read a workbook keep their original sheet names, so
// their loaders only need a file-path change. Aggregate KPIs without an event
// workbook (01, 02, 03, 08, 11) get a deterministically-synthesized 25-row
// record sheet that their loaders aggregate from.
//
// Run:  node scripts/gen-kpi-workbooks.mjs

import * as XLSX from "xlsx"
import * as fs from "node:fs"
import { readFileSync, mkdirSync, existsSync } from "node:fs"
import { join } from "node:path"

// The ESM build of SheetSJS does not auto-wire Node's fs; do it explicitly.
XLSX.set_fs(fs)

const ROOT = process.cwd()
const N = 25

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function colLetter(idx) {
  let s = ""
  idx += 1
  while (idx > 0) {
    const m = (idx - 1) % 26
    s = String.fromCharCode(65 + m) + s
    idx = Math.floor((idx - 1) / 26)
  }
  return s
}

// simple deterministic PRNG so re-runs produce identical workbooks
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)]

function addDays(iso, days) {
  const d = new Date(iso + "T00:00:00Z")
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

// normalize an array-of-objects records sheet to exactly N rows
function normalizeRows(rows, n = N) {
  if (rows.length >= n) return rows.slice(0, n)
  if (rows.length === 0) return rows
  const out = rows.slice()
  let i = 0
  while (out.length < n) {
    const src = rows[i % rows.length]
    const clone = { ...src }
    for (const k of Object.keys(clone)) {
      const key = k.toLowerCase()
      if (key.endsWith("id") || key === "id" || key.includes("event id") || key.includes("incident id")) {
        clone[k] = `${String(src[k]).replace(/-\d+$/, "")}-${out.length + 1}`
      }
    }
    out.push(clone)
    i++
  }
  return out
}

// Build a Summary sheet with live formulas referencing the primary sheet.
function buildSummarySheet(kpiId, primaryName, headers, rowCount, extra = []) {
  const headerRow = 1
  const first = headerRow + 1
  const last = headerRow + rowCount
  const q = `'${primaryName}'`

  const colFor = (predicate) => {
    const idx = headers.findIndex((h) => predicate(String(h).toLowerCase()))
    return idx >= 0 ? colLetter(idx) : null
  }
  const idCol = colLetter(0)
  const damageCol = colFor((h) => h.includes("damage"))
  const statusCol = colFor((h) => h === "status" || h.includes("result") || h.includes("meets"))

  const rows = [
    [`${kpiId.toUpperCase()} — Summary`, null],
    ["Metric", "Value"],
    ["Total Records", { f: `COUNTA(${q}!${idCol}${first}:${idCol}${last})` }],
  ]
  if (damageCol) {
    rows.push(["Total Damage Points", { f: `SUM(${q}!${damageCol}${first}:${damageCol}${last})` }])
    rows.push([
      "Avg Damage / Record",
      { f: `IFERROR(AVERAGE(${q}!${damageCol}${first}:${damageCol}${last}),0)` },
    ])
    rows.push([
      "Records With Damage",
      { f: `COUNTIF(${q}!${damageCol}${first}:${damageCol}${last},">0")` },
    ])
  }
  if (statusCol) {
    rows.push([
      "Fail / Breach Count",
      { f: `COUNTIF(${q}!${statusCol}${first}:${statusCol}${last},"*ail*")+COUNTIF(${q}!${statusCol}${first}:${statusCol}${last},"*reach*")` },
    ])
  }
  for (const [label, formula] of extra) {
    rows.push([label, formula ? { f: formula } : null])
  }

  const ws = XLSX.utils.aoa_to_sheet(rows.map((r) => r.map((c) => (c && typeof c === "object" ? null : c))))
  // now inject formula cells
  rows.forEach((r, ri) => {
    const cell = r[1]
    if (cell && typeof cell === "object" && cell.f) {
      const addr = `B${ri + 1}`
      ws[addr] = { t: "n", f: cell.f }
    }
  })
  ws["!cols"] = [{ wch: 34 }, { wch: 20 }]
  return ws
}

function writeWorkbook(kpiId, sheets, primaryName, primaryHeaders, primaryCount, summaryExtras) {
  const wb = XLSX.utils.book_new()
  for (const { name, ws } of sheets) {
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31))
  }
  const summary = buildSummarySheet(kpiId, primaryName, primaryHeaders, primaryCount, summaryExtras)
  XLSX.utils.book_append_sheet(wb, summary, "Summary")

  // Canonical local fallback: data/kpi-NN/kpi-NN.xlsx. This is the ONLY artifact
  // the app depends on now — every dashboard reads live bytes through
  // lib/kpi-data/get-rows.ts (SharePoint, with this file as offline fallback).
  //
  // NOTE: the old `public/kpi-NN/kpi-NN.xlsx` download mirrors and the
  // `lib/kpi-NN/rows.json` snapshots are no longer generated or read — downloads
  // now stream live via /api/kpi/[id]/xlsx and data is fetched at request time.
  const dir = join(ROOT, "data", kpiId)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const out = join(dir, `${kpiId}.xlsx`)
  XLSX.writeFile(wb, out)

  console.log(`  ✓ ${out}  [${wb.SheetNames.join(", ")}]  primary="${primaryName}" (${primaryCount} rows)`)
}

// Copy an existing workbook's sheets verbatim, normalizing the primary sheet to 25 rows.
function fromExisting(kpiId, sourcePath, primaryName, opts = {}) {
  const wb = XLSX.readFile(join(ROOT, sourcePath), { cellDates: true })
  const sheets = []
  let primaryHeaders = []
  let primaryCount = 0

  for (const sn of wb.SheetNames) {
    if (opts.skipSheets?.includes(sn)) continue
    // Our generator appends its own "Summary" sheet, so drop any pre-existing one.
    if (sn === "Summary") continue
    if (sn === primaryName && opts.normalize !== false) {
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[sn], { defval: null })
      const norm = normalizeRows(rows, N)
      const ws = XLSX.utils.json_to_sheet(norm)
      sheets.push({ name: sn, ws })
      primaryHeaders = norm.length ? Object.keys(norm[0]) : []
      primaryCount = norm.length
    } else {
      sheets.push({ name: sn, ws: wb.Sheets[sn] })
      if (sn === primaryName) {
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[sn], { defval: null })
        primaryHeaders = rows.length ? Object.keys(rows[0]) : []
        primaryCount = rows.length
      }
    }
  }
  writeWorkbook(kpiId, sheets, primaryName, primaryHeaders, primaryCount, opts.summaryExtras || [])
}

// Build a workbook from an in-memory records array (+ optional extra sheets).
function fromRecords(kpiId, primaryName, records, extraSheets = [], summaryExtras = []) {
  const ws = XLSX.utils.json_to_sheet(records)
  const sheets = [{ name: primaryName, ws }, ...extraSheets]
  const headers = records.length ? Object.keys(records[0]) : []
  writeWorkbook(kpiId, sheets, primaryName, headers, records.length, summaryExtras)
}

// ---------------------------------------------------------------------------
// synthesized datasets for aggregate KPIs (01, 02, 03, 08, 11)
// ---------------------------------------------------------------------------

function kpi01() {
  const rnd = mulberry32(101)
  const cats = ["Inaccurate Information", "Lack of Professionalism", "Unsafe Behaviour", "Refusal of Service", "Destructive Behaviour"]
  const sources = ["HIAA Annual Report", "Public Complaint", "Operational Report"]
  const locations = ["Terminal A", "Terminal B", "Parking Area", "Restricted Area", "Operations Office", "Arrivals", "Departures", "Gate 12", "Checkpoint 3"]
  const rows = []
  let date = "2026-01-04"
  for (let i = 0; i < N; i++) {
    const substantiated = rnd() > 0.45
    const treatment = substantiated && rnd() > 0.35 ? "Included" : "Excluded"
    const counted = substantiated && treatment === "Included"
    date = addDays(date, 3 + Math.floor(rnd() * 10))
    rows.push({
      "Event ID": `EVT-2026-${String(i + 1).padStart(3, "0")}`,
      Date: date,
      Source: pick(rnd, sources),
      Location: pick(rnd, locations),
      Category: pick(rnd, cats),
      Substantiated: substantiated ? "Yes" : "No",
      Treatment: treatment,
      "Damage Points": counted ? 2 : 0,
    })
  }
  fromRecords("kpi-01", "Data", rows, [], [
    ["Counted (Substantiated & Included)", `COUNTIFS('Data'!F2:F26,"Yes",'Data'!G2:G26,"Included")`],
    ["Result (0 = PASS)", null],
  ])
}

function kpi02() {
  const rnd = mulberry32(102)
  const sources = ["Reception", "Website", "Information Booth", "Stakeholders", "Airport Operations Centre", "Social Media"]
  const rows = []
  let date = "2025-01-06"
  for (let i = 0; i < N; i++) {
    date = addDays(date, 5 + Math.floor(rnd() * 9))
    const solicited = rnd() > 0.88
    rows.push({
      ID: `C-${1001 + i}`,
      Date: date,
      Source: pick(rnd, sources),
      Solicited: solicited ? "Yes" : "No",
      Summary: solicited ? "Solicited compliment (excluded from count)." : "Passenger commended staff assistance and professionalism.",
    })
  }
  fromRecords("kpi-02", "Data", rows, [], [
    ["Valid Compliments (unsolicited)", `COUNTIF('Data'!D2:D26,"No")`],
    ["Solicited (excluded)", `COUNTIF('Data'!D2:D26,"Yes")`],
  ])
}

function kpi03() {
  const rnd = mulberry32(103)
  const shifts = ["Day (07-15)", "Evening (15-23)", "Night (23-07)"]
  const posts = ["Perimeter Gate A", "Perimeter Gate B", "Main Control Room", "Reception Desk", "Loading Dock", "Cargo Screening"]
  const rows = []
  let date = "2025-01-05"
  for (let i = 0; i < N; i++) {
    date = addDays(date, 10 + Math.floor(rnd() * 8))
    const required = 12
    const actual = required - (1 + Math.floor(rnd() * 3))
    const dur = `${1 + Math.floor(rnd() * 4)}h ${String(Math.floor(rnd() * 60)).padStart(2, "0")}m`
    rows.push({
      "Occurrence ID": `OCC-${String(i + 1).padStart(4, "0")}`,
      Date: date,
      Shift: pick(rnd, shifts),
      Post: pick(rnd, posts),
      Required: required,
      Actual: actual,
      Duration: dur,
      "Damage Points": 10,
    })
  }
  fromRecords("kpi-03", "Data", rows, [], [
    ["Occurrences Below Minimum", `COUNTA('Data'!A2:A26)`],
    ["Minimum Staffing Level", 12 && null],
  ])
}

function kpi08() {
  const rnd = mulberry32(108)
  const sites = ["North Gate", "South Perimeter", "Warehouse A", "Warehouse B", "Loading Bay", "Admin Block", "Data Centre", "Car Park East", "Car Park West"]
  const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
  const outcomes = ["Completed on time", "Completed on time", "Completed on time", "Completed late", "Missed"]
  const rows = []
  let date = "2025-07-02"
  for (let i = 0; i < N; i++) {
    date = addDays(date, 12 + Math.floor(rnd() * 6))
    const scheduled = 60 + Math.floor(rnd() * 40)
    const completed = Math.round(scheduled * (0.7 + rnd() * 0.28))
    rows.push({
      "Patrol ID": `PAT-${String(i + 1).padStart(4, "0")}`,
      Date: date,
      Month: months[i % months.length],
      Site: sites[i % sites.length],
      Scheduled: scheduled,
      Completed: completed,
      Outcome: pick(rnd, outcomes),
      "Compliance Rate": Math.round((completed / scheduled) * 1000) / 10,
    })
  }
  fromRecords("kpi-08", "Data", rows, [], [
    ["Total Scheduled", `SUM('Data'!E2:E26)`],
    ["Total Completed", `SUM('Data'!F2:F26)`],
    ["Overall Compliance %", `ROUND(SUM('Data'!F2:F26)/SUM('Data'!E2:E26)*100,1)`],
  ])
}

function kpi11() {
  const rnd = mulberry32(111)
  const directives = ["Access Control Directive", "Screening Directive", "Perimeter Directive", "Badging Directive", "Patrol Directive", "Incident Reporting Directive"]
  const posts = ["Terminal", "Cargo", "Perimeter", "AOC", "Checkpoint"]
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const rows = []
  let date = "2025-01-08"
  for (let i = 0; i < N; i++) {
    date = addDays(date, 12 + Math.floor(rnd() * 5))
    const compliant = rnd() > 0.18
    rows.push({
      "Audit ID": `AUD-${String(i + 1).padStart(4, "0")}`,
      Date: date,
      Period: months[i % months.length],
      Directive: pick(rnd, directives),
      Post: pick(rnd, posts),
      Result: compliant ? "Compliant" : "Non-Compliant",
      "Damage Points": compliant ? 0 : 5,
    })
  }
  fromRecords("kpi-11", "Data", rows, [], [
    ["Directives Audited", `COUNTA('Data'!A2:A26)`],
    ["Non-Compliance Events", `COUNTIF('Data'!F2:F26,"Non-Compliant")`],
    ["Compliance Rate %", `ROUND(COUNTIF('Data'!F2:F26,"Compliant")/COUNTA('Data'!A2:A26)*100,1)`],
  ])
}

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------

console.log("Generating KPI workbooks…")

// synthesized (aggregate) KPIs
kpi01()
kpi02()
kpi03()
kpi08()
kpi11()

// existing-workbook KPIs (sheet names preserved)
fromExisting("kpi-04", "data/kpi-04-events.xlsx", "Events")
fromExisting("kpi-05", "data/kpi-05.xlsx", "Events")
fromExisting("kpi-06", "data/kpi-06-invoicing.xlsx", "Weekly Invoicing Log")
fromExisting("kpi-07", "public/KPI-07-dashboard-data.xlsx", "Incident Log")
fromExisting("kpi-09", "public/kpi-09-timeliness-data.xlsx", "KPI-09 Timeliness")
fromExisting("kpi-10", "public/KPI-10-Uniform-Dashboard.xlsx", "Daily Events")
fromExisting("kpi-12", "public/data/KPI-12-OLA-data.xlsx", "Incident Log")
fromExisting("kpi-13", "public/KPI-13-Shift-Briefings.xlsx", "Event Log")
fromExisting("kpi-14", "public/data/kpi-14-events.xlsx", "Events")
fromExisting("kpi-15", "data/kpi-15-vehicles.xlsx", "Events")
fromExisting("kpi-16", "public/KPI-16-Response-Times.xlsx", "Incident Log")
fromExisting("kpi-17", "public/kpi-17-contractor-safety-plan.xlsx", "Events")
fromExisting("kpi-18", "public/kpi-18-data.xlsx", "Events Log")
fromExisting("kpi-19", "public/KPI-19-On-Shift-Distractions.xlsx", "Events Log")
fromExisting("kpi-20", "public/data/kpi-20-avop-da-shifts.xlsx", "Shift Log")
fromExisting("kpi-21", "public/kpi-21-pass-control-staffing.xlsx", "Weekly Staffing")

console.log("Done.")
