/**
 * Generates the two CNS HIAA KPI Dashboard manuals as Word (.docx) files:
 *   1. User Guide            (audience: all dashboard users, non-technical)
 *   2. IT / Technical Guide  (audience: IT administrators / developers)
 *
 * Output: public/manuals/*.docx  (served by the in-app /help page).
 *
 * Run with:  node scripts/generate-manuals.mjs
 * Regenerate whenever the manual content or screenshots change.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ImageRun,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  LevelFormat,
  ExternalHyperlink,
  ShadingType,
} from "docx"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const ASSETS = path.join(ROOT, ".v0", "manual-assets")
const OUT_DIR = path.join(ROOT, "public", "manuals")

// ---- palette ---------------------------------------------------------------
const NAVY = "1F2A44"
const BLUE = "2563EB"
const GREY = "5B6472"
const LIGHT = "EEF2F8"
const BORDER = "D5DBE5"
const WHITE = "FFFFFF"

// ---- content-width helpers (Letter, 1" margins ≈ 6.5in = 624px @96dpi) -----
const MAX_W = 610

function imgSized(file, targetW) {
  // read PNG dimensions from the IHDR chunk to preserve aspect ratio
  const buf = fs.readFileSync(path.join(ASSETS, file))
  const w = buf.readUInt32BE(16)
  const h = buf.readUInt32BE(20)
  const width = Math.min(targetW, MAX_W)
  const height = Math.round((width * h) / w)
  return { data: buf, width, height }
}

// ---- building blocks -------------------------------------------------------
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 140 },
    children: [new TextRun({ text, bold: true, color: NAVY, size: 30 })],
  })
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 100 },
    children: [new TextRun({ text, bold: true, color: NAVY, size: 24 })],
  })
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    children: [new TextRun({ text, bold: true, color: BLUE, size: 21 })],
  })
}
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 288 },
    children: [new TextRun({ text, color: opts.color ?? "222933", size: opts.size ?? 21, italics: opts.italics })],
  })
}
function runs(children, opts = {}) {
  return new Paragraph({ spacing: { after: 120, line: 288 }, children, ...opts })
}
function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 60, line: 276 },
    children: [new TextRun({ text, size: 21, color: "222933" })],
  })
}
function step(text, ref = "steps") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 80, line: 276 },
    children: [new TextRun({ text, size: 21, color: "222933" })],
  })
}

function callout(title, body, tint = LIGHT) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: outlineBorders(BLUE),
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, color: "auto", fill: tint },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: [
              new Paragraph({
                spacing: { after: title ? 60 : 0 },
                children: [new TextRun({ text: title, bold: true, color: NAVY, size: 20 })],
              }),
              ...(body
                ? [new Paragraph({ children: [new TextRun({ text: body, size: 20, color: "2B3442" })] })]
                : []),
            ],
          }),
        ],
      }),
    ],
  })
}

function outlineBorders(color = BORDER) {
  const b = { style: BorderStyle.SINGLE, size: 4, color }
  return { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b }
}

function table(headers, rows, widths) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (t) =>
        new TableCell({
          shading: { type: ShadingType.CLEAR, color: "auto", fill: NAVY },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, color: WHITE, size: 19 })] })],
        }),
    ),
  })
  const bodyRows = rows.map(
    (cells, i) =>
      new TableRow({
        children: cells.map(
          (t) =>
            new TableCell({
              shading: { type: ShadingType.CLEAR, color: "auto", fill: i % 2 ? "F6F8FC" : WHITE },
              margins: { top: 70, bottom: 70, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: String(t), size: 19, color: "222933" })] })],
            }),
        ),
      }),
  )
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: widths,
    borders: outlineBorders(),
    rows: [headerRow, ...bodyRows],
  })
}

function figure(file, targetW, caption) {
  const { data, width, height } = imgSized(file, targetW)
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 40 },
      children: [new ImageRun({ type: "png", data, transformation: { width, height } })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [new TextRun({ text: caption, italics: true, size: 17, color: GREY })],
    }),
  ]
}

function code(text) {
  return new Paragraph({
    spacing: { after: 40 },
    shading: { type: ShadingType.CLEAR, color: "auto", fill: "F2F4F8" },
    children: [new TextRun({ text, font: "Consolas", size: 18, color: "1B2430" })],
  })
}

function spacer() {
  return new Paragraph({ spacing: { after: 60 }, children: [] })
}
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] })
}

function coverPage(title, subtitle, audience, colorAccent) {
  return [
    new Paragraph({ spacing: { before: 1400 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: "CNS HIAA", bold: true, color: colorAccent, size: 40 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: "Airport KPI Dashboard", color: GREY, size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: title, bold: true, color: NAVY, size: 52 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 500 },
      children: [new TextRun({ text: subtitle, color: BLUE, size: 26 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: audience, bold: true, color: NAVY, size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Version 1.0  |  July 2026", color: GREY, size: 20 })],
    }),
    pageBreak(),
  ]
}

function docShell(titleForHeader, children) {
  return {
    creator: "CNS HIAA KPI Dashboard",
    title: titleForHeader,
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 21, color: "222933" } },
      },
    },
    numbering: {
      config: [
        {
          reference: "steps",
          levels: [
            { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.START,
              style: { paragraph: { indent: { left: 460, hanging: 300 } } } },
          ],
        },
      ],
    },
    sections: [
      {
        properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 40 },
                border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER } },
                children: [new TextRun({ text: titleForHeader, color: GREY, size: 16 })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                border: { top: { style: BorderStyle.SINGLE, size: 4, color: BORDER } },
                children: [
                  new TextRun({ text: "CNS HIAA Airport KPI Dashboard  ·  Page ", color: GREY, size: 16 }),
                  new TextRun({ children: [PageNumber.CURRENT], color: GREY, size: 16 }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  }
}

// ============================================================================
// DOCUMENT 1 — USER GUIDE
// ============================================================================
function buildUserGuide() {
  const c = []
  c.push(...coverPage("User Guide", "Using the KPI Dashboard & Notifications", "For all dashboard users", BLUE))

  c.push(h1("Welcome"))
  c.push(
    p(
      "The CNS HIAA Airport KPI Dashboard gives you a single, always-current view of 21 key performance indicators (KPI-01 through KPI-21) and an overall portfolio status. This guide explains how to read the dashboards, follow the KPIs that matter to you, and manage the notifications you receive when something changes. No technical knowledge is required.",
    ),
  )
  c.push(
    callout(
      "Works on every device",
      "The dashboard runs in any modern web browser on Windows PC, Mac, iPhone, iPad, and Android phones and tablets. There is nothing to install — just open the web address your organization provides and sign in. The layout adapts automatically to your screen size.",
    ),
  )

  c.push(h1("1. How this guide is organized"))
  c.push(
    table(
      ["Section", "What you will learn"],
      [
        ["Getting around", "Signing in and moving between the four areas on any device."],
        ["Reading the dashboards", "How the Executive Summary and KPI pages present your data."],
        ["Notifications", "Following KPIs and choosing how you are alerted."],
        ["On your phone or tablet", "Using the same features on a smaller screen."],
        ["Troubleshooting", "What to check if something does not look right."],
      ],
      [2600, 6800],
    ),
  )

  c.push(pageBreak())
  c.push(h1("2. Getting around"))
  c.push(h2("2.1 Sign in"))
  c.push(step("Open the dashboard web address supplied by your organization in any browser."))
  c.push(step("Sign in with your normal organizational account when prompted."))
  c.push(step("You arrive on the Executive Summary — the portfolio roll-up of all KPIs."))
  c.push(h2("2.2 The four areas"))
  c.push(
    table(
      ["Area", "Purpose"],
      [
        ["Executive Summary", "One-page portfolio status: overall band, rolling damage points, and each KPI's status."],
        ["KPIs", "Detailed dashboard for each KPI (KPI-01 to KPI-21) with charts and the numbers behind them."],
        ["Reports", "Printable / exportable summaries for contract and management reporting."],
        ["Notifications", "Your alert inbox, the KPIs you follow, and your profile."],
      ],
      [2600, 6800],
    ),
  )
  c.push(spacer())
  c.push(
    callout(
      "On a phone or tablet",
      "If you do not see the menu across the top, tap the menu button (three lines) in the top-right corner to open the navigation. Tap any item to jump to that area; the menu closes automatically.",
    ),
  )

  c.push(pageBreak())
  c.push(h1("3. Reading the dashboards"))
  c.push(
    p(
      "Every number you see is calculated live from the source spreadsheets maintained for each KPI. When the underlying spreadsheet is updated, the dashboard reflects the new values on the next refresh — there is no separate data entry in the app.",
    ),
  )
  c.push(h2("3.1 Executive Summary"))
  c.push(bullet("The overall portfolio band (for example, Event-of-Default Threshold Reached) summarizes all KPIs together."))
  c.push(bullet("Rolling 6-month damage points and the default threshold show how close the portfolio is to a breach."))
  c.push(bullet("Each KPI shows a green / amber / red status so you can spot problem areas at a glance."))
  c.push(h2("3.2 KPI pages"))
  c.push(bullet("Open the KPIs area and choose a KPI (KPI-01 to KPI-21)."))
  c.push(bullet("Each page shows the headline status, the counts behind it, damage points, and trend charts."))
  c.push(bullet("Charts and tables are driven entirely by that KPI's spreadsheet, so they always match the source of record."))
  c.push(
    callout(
      "Status colors",
      "Green = on target. Amber (warning) = attention needed. Red (critical) = target missed / damage incurred. The same colors are used in notifications so the two always agree.",
    ),
  )

  c.push(pageBreak())
  c.push(h1("4. Notifications"))
  c.push(
    p(
      "The Notifications area lets you decide which KPI changes you want to follow and how you want to hear about them. A notification is created when a KPI or the overall portfolio changes status, worsens, recovers, or crosses an alert band. The dashboard inbox is the authoritative record of every alert the application generates.",
    ),
  )
  c.push(bullet("Dashboard notifications are available immediately."))
  c.push(bullet("Email and Microsoft Teams delivery become available after IT enables those channels."))
  c.push(bullet("The first evaluation records a silent baseline, so you are not flooded with historical alerts."))

  c.push(h2("4.1 Open Notifications"))
  c.push(step("Select Notifications in the top navigation, or select the bell icon and then View all notifications."))
  c.push(step("Use the Inbox tab to review alerts, Subscriptions to choose what you follow, and Profile to check your account and role."))
  c.push(...figure("bell.png", 400, "Figure 1. The header bell shows unread alerts and a quick panel with a link to all notifications."))

  c.push(h2("4.2 Review your alerts (Inbox)"))
  c.push(bullet("Unread alerts appear in the inbox and increase the bell badge count."))
  c.push(bullet("Open an alert to see the KPI, the status change, severity, timestamp, and message."))
  c.push(bullet("Use Mark as read after reviewing, or Mark all as read once you have triaged the inbox."))
  c.push(bullet('Use Check now only when you want an immediate evaluation — normally this runs automatically.'))
  c.push(bullet("A recovery alert confirms a KPI has improved from a worse band to a better one."))
  c.push(...figure("inbox.png", 560, 'Figure 2. The Notifications inbox with the manual "Check now" evaluation.'))

  c.push(pageBreak())
  c.push(h2("4.3 Choose what you follow (Subscriptions)"))
  c.push(step("Select the Subscriptions tab."))
  c.push(step("Enable Dashboard under Overall portfolio status to follow the combined KPI status."))
  c.push(step("Enable Dashboard beside each KPI you are responsible for or need to monitor."))
  c.push(step("Choose a minimum severity — Info, Warning, or Critical. You receive only alerts at or above that level."))
  c.push(step("Leave Email and Teams for later; enable them once IT activates those channels."))
  c.push(step("Changes save automatically; a check mark confirms each save."))
  c.push(...figure("subscriptions.png", 540, "Figure 3. Subscription controls for the portfolio and for individual KPI-01 through KPI-21."))
  c.push(
    table(
      ["Severity", "Use when", "Typical result"],
      [
        ["Info", "You want visibility into all status changes, including minor ones.", "Highest message volume."],
        ["Warning", "You need operational exceptions and worsening performance.", "Recommended default for KPI owners."],
        ["Critical", "You only need urgent, damage-point-level conditions.", "Lowest volume; highest urgency."],
      ],
      [1600, 4600, 3200],
    ),
  )
  c.push(spacer())
  c.push(
    callout(
      "Recommended setup",
      "KPI owners: follow your assigned KPIs on Dashboard at Warning. Operational managers: also follow Overall portfolio status. Executives: Critical-only for urgent exceptions rather than routine changes.",
    ),
  )

  c.push(pageBreak())
  c.push(h2("4.4 Verify your profile"))
  c.push(
    p(
      "The Profile tab shows the identity and role the application is using for you. In production this comes from your Microsoft Entra ID account; in a preview it may be a test identity.",
    ),
  )
  c.push(...figure("profile.png", 560, "Figure 4. Profile view showing your identity, application role, and directory identifier."))
  c.push(
    table(
      ["Role", "What you can do"],
      [
        ["Viewer", "Read dashboards and manage your own notification preferences."],
        ["KPI Owner", "Viewer access plus responsibility for assigned KPIs and their alerts."],
        ["Manager", "Broader portfolio visibility and operational reporting access."],
        ["Administrator", "Full access, including subscription assignment and audit review."],
      ],
      [2400, 7000],
    ),
  )

  c.push(pageBreak())
  c.push(h1("5. Using the dashboard on your phone or tablet"))
  c.push(p("The dashboard is designed to work the same way on small screens as on a computer."))
  c.push(bullet("iPhone / Android phone: open the web address in Safari or Chrome and sign in as usual."))
  c.push(bullet("Use the menu button (three lines, top-right) to move between areas."))
  c.push(bullet("KPI cards and charts stack into a single column so they stay readable — scroll to see more."))
  c.push(bullet("The Subscriptions controls wrap to fit; tap a channel button to turn it on or off."))
  c.push(bullet('Add the site to your Home Screen (Share → "Add to Home Screen") for quick, app-like access.'))
  c.push(
    callout(
      "Tip",
      "Everything is saved to your account, not the device. Preferences you set on your computer show up on your phone and vice-versa.",
    ),
  )

  c.push(h1("6. Troubleshooting"))
  c.push(
    table(
      ["Situation", "What to check"],
      [
        ["I expected an alert but none appeared", "Confirm the KPI is enabled under Subscriptions, your severity threshold includes the event, and the status actually changed after the baseline."],
        ["The menu is missing on my phone", "Tap the menu button (three lines) in the top-right corner."],
        ["Numbers look out of date", "Data refreshes periodically from the source spreadsheets; check the 'Data refreshed' time and try again shortly."],
        ["Email / Teams options are greyed out", "Those channels are enabled by IT. Use Dashboard alerts until then."],
        ["I cannot sign in", "Use your normal organizational account; contact IT if the problem persists."],
      ],
      [3200, 6200],
    ),
  )
  c.push(spacer())
  c.push(
    callout(
      "Your responsibilities",
      "Keep subscriptions limited to KPIs relevant to your role, and remember the dashboard inbox — not email — is the official record of alerts.",
    ),
  )

  return new Document(docShell("CNS HIAA KPI Dashboard — User Guide", c))
}

// ============================================================================
// DOCUMENT 2 — IT / TECHNICAL GUIDE
// ============================================================================
function buildItGuide() {
  const c = []
  c.push(...coverPage("IT & Technical Guide", "Architecture, Data Pipeline, Deployment & Operations", "For IT administrators and developers", NAVY))

  c.push(h1("1. Overview"))
  c.push(
    p(
      "The CNS HIAA Airport KPI Dashboard is a Next.js (App Router) application. It reads 21 KPI workbooks (KPI-01 … KPI-21) from SharePoint (or bundled local fallbacks), computes each KPI and an overall portfolio status server-side, and renders responsive dashboards, an executive summary, printable reports, and a notification system backed by Azure Database for PostgreSQL Flexible Server.",
    ),
  )
  c.push(
    callout(
      "Key principle: spreadsheets drive everything",
      "Every KPI value, chart, and status — and therefore every notification — is derived from the KPI workbooks. There is no separate data store for KPI values; the .xlsx files are the single source of truth.",
    ),
  )
  c.push(h2("1.1 Technology stack"))
  c.push(
    table(
      ["Layer", "Technology"],
      [
        ["Framework", "Next.js 16 (App Router, React Server Components), TypeScript"],
        ["Hosting", "Vercel (serverless / edge-ready)"],
        ["Data source", "Microsoft SharePoint document library via Microsoft Graph (app-only)"],
        ["Spreadsheet parsing", "SheetJS (xlsx) — server-side only"],
        ["Charts / visualization", "Recharts via shadcn/ui chart components"],
        ["Notifications database", "Azure Database for PostgreSQL Flexible Server (Canada East) with Drizzle ORM"],
        ["Identity", "Pluggable provider (dev identity now; Microsoft Entra ID / MSAL ready)"],
      ],
      [2800, 6600],
    ),
  )

  c.push(pageBreak())
  c.push(h1("2. Data pipeline — how spreadsheets drive KPI-01 … KPI-21"))
  c.push(
    p(
      "Each KPI has its own workbook and its own adapter. The same pipeline feeds both the individual KPI dashboards and the Executive Summary roll-up, so all visualizations and alerts stay consistent.",
    ),
  )
  c.push(h2("2.1 Flow"))
  c.push(code("SharePoint / local .xlsx"))
  c.push(code("   → lib/xlsx-loader.ts            (fetch + parse workbook with SheetJS)"))
  c.push(code("   → lib/sharepoint/workbook-source.ts  (Graph download, ISR cache, local fallback)"))
  c.push(code("   → lib/kpi-data/get-rows.ts      (read a sheet into typed rows)"))
  c.push(code("   → lib/kpi-NN/get-data.ts        (per-KPI calculation from those rows)"))
  c.push(code("   → lib/executive-summary/adapters.ts  (normalize each KPI for the roll-up)"))
  c.push(code("   → lib/executive-summary/aggregate.ts (getExecutiveSummary → portfolio status)"))
  c.push(code("   → dashboards, charts, reports, and the notification engine"))
  c.push(spacer())
  c.push(h2("2.2 What each stage does"))
  c.push(bullet("Loader: downloads the workbook (Graph) or reads the bundled fallback, then parses it with SheetJS server-side."))
  c.push(bullet("Workbook source: resolves the file path per KPI, applies the ISR cache window, and falls back to data/kpi-NN/kpi-NN.xlsx when SharePoint is not configured."))
  c.push(bullet("get-rows: turns a named sheet into typed row objects for the calculation."))
  c.push(bullet("Per-KPI get-data: applies that KPI's business rules (counts, exclusions, damage points, status)."))
  c.push(bullet("Adapters + aggregate: convert every KPI into a common shape and compute the rolling 6-month portfolio band and threshold."))
  c.push(
    callout(
      "All 21 KPIs are workbook-driven",
      "Each lib/kpi-NN/get-data.ts reads through get-rows / workbook-source rather than hardcoding values. Confirm with:  grep -L \"get-rows\\|workbook-source\" lib/kpi-*/get-data.ts  (should return nothing).",
    ),
  )
  c.push(h2("2.3 Workbook layout"))
  c.push(bullet("Default: folder-per-KPI — kpi-01/kpi-01.xlsx … kpi-21/kpi-21.xlsx (SHAREPOINT_FILE_TEMPLATE = {id}/{id}.xlsx)."))
  c.push(bullet("Flat library alternative: set SHAREPOINT_FILE_TEMPLATE = {id}.xlsx."))
  c.push(bullet("Formula cells are read as their cached computed values; keep workbooks recalculated before publishing."))

  c.push(pageBreak())
  c.push(h1("3. Configuration (environment variables)"))
  c.push(p("With none of these set, the app runs on the bundled local workbooks — useful for dev and preview. Set the SharePoint group to read live data. Copy .env.example to .env.local and fill in real values; never commit secrets."))
  c.push(h2("3.1 SharePoint / Microsoft Graph"))
  c.push(
    table(
      ["Variable", "Purpose"],
      [
        ["SHAREPOINT_TENANT_ID", "Entra tenant (directory) ID."],
        ["SHAREPOINT_CLIENT_ID", "App registration (client) ID."],
        ["SHAREPOINT_CLIENT_SECRET", "App client secret (server-side only)."],
        ["SHAREPOINT_SITE_URL", "Site hosting the KPI document library."],
        ["SHAREPOINT_BASE_PATH", "Optional sub-folder inside the library (blank = root)."],
        ["SHAREPOINT_FILE_TEMPLATE", "Workbook path template; default {id}/{id}.xlsx."],
        ["SHAREPOINT_TIMEOUT_MS / _MAX_RETRIES", "Graph download tuning (default 15000 / 3)."],
      ],
      [3400, 6000],
    ),
  )
  c.push(h2("3.2 Caching & refresh"))
  c.push(
    table(
      ["Variable", "Purpose"],
      [
        ["KPI_CACHE_TTL_SECONDS", "ISR window for a workbook fetch (300 with webhook; 60 poll-only)."],
        ["REVALIDATE_SECRET", "Shared secret to POST /api/revalidate and for /api/health?deep=1."],
      ],
      [3400, 6000],
    ),
  )
  c.push(h2("3.3 Notifications"))
  c.push(
    table(
      ["Variable", "Purpose"],
      [
        ["DATABASE_URL", "Azure Database for PostgreSQL Flexible Server connection string (TLS required)."],
        ["AZURE_PG_USE_ENTRA", "true to authenticate via Microsoft Entra ID managed-identity tokens instead of a password."],
        ["AZURE_PG_SSL_CA", "Optional CA bundle (PEM or file path) for verify-full TLS; blank uses Node's trust store."],
        ["AUTH_REQUIRE_ENTRA", "true in production to force Entra sign-in (proxy redirects unauthenticated page requests)."],
        ["NOTIFY_DEV_USER_ID / _EMAIL / _NAME / _ROLE", "Local dev fallback identity, used only when no Easy Auth principal is present."],
        ["NOTIFY_EVALUATE_SECRET", "Shared secret to POST /api/notifications/evaluate (scheduler / webhook)."],
        ["NOTIFY_EMAIL_ENABLED", "Feature flag for Outlook email delivery (default false)."],
        ["NOTIFY_TEAMS_ENABLED", "Feature flag for Microsoft Teams delivery (default false)."],
      ],
      [3800, 5600],
    ),
  )
  c.push(h2("3.4 Provisioning the Azure PostgreSQL database"))
  c.push(p("Create an Azure Database for PostgreSQL Flexible Server in Canada East (same region as the App Service) with TLS enforced, then create a database (e.g. \"kpi\") and provision the tables. The app connects with the standard pg driver — no Azure-specific driver is required."))
  c.push(bullet("Provision the schema with the bundled DDL: psql \"host=<server>.postgres.database.azure.com port=5432 dbname=kpi user=dbadmin sslmode=require\" -f scripts/db/schema.sql (idempotent, safe to re-run)."))
  c.push(bullet("Password auth: put the credentials in DATABASE_URL with ?sslmode=require."))
  c.push(bullet("Entra ID auth (recommended for production): set AZURE_PG_USE_ENTRA=true and omit the password; the App Service managed identity mints a short-lived token per connection. Grant the identity a PostgreSQL role via Microsoft Entra admin."))
  c.push(bullet("Data residency: keeping the server in Canada East co-locates the data with the app and satisfies the in-region requirement."))

  c.push(h2("3.5 Authentication and access control (Microsoft Entra ID)"))
  c.push(p("Sign-in is handled by Azure App Service Authentication (\"Easy Auth\"), which validates the Entra ID login before the request reaches the app and injects the signed-in principal as request headers. The app reads that principal in lib/auth/easy-auth.ts — it never handles passwords, tokens, or client secrets."))
  c.push(bullet("Enable: on the App Service, turn on Authentication, add the Microsoft identity provider, and set unauthenticated requests to require login. Set AUTH_REQUIRE_ENTRA=true so the app's proxy also redirects any unauthenticated page request to Entra."))
  c.push(bullet("Roles: define three App Roles on the Entra app registration — Admin, Manager, Viewer — and assign users or security groups to them. The app maps any role containing \"admin\" to admin, \"manager\" to manager, and everything else to viewer; the highest role wins."))
  c.push(bullet("Role of record: on each sign-in the user's role from Entra is synced to app_user, so directory changes take effect on next login. Identity is keyed by the Entra object id (oid)."))
  c.push(bullet("What roles gate: every authenticated user can view all 21 KPIs and manage their own subscriptions. Manager and Admin can additionally run evaluations (\"Check now\"); Admin is reserved for assignment and audit review (Phase 5)."))
  c.push(bullet("Local dev / preview: with no Easy Auth in front of the app, it falls back to the NOTIFY_DEV_USER_* identity so the UI stays fully functional. This fallback is never used once a real Entra user is signed in."))
  c.push(bullet("Sign-out: the profile menu links to /.auth/logout, App Service's Easy Auth logout endpoint."))

  c.push(pageBreak())
  c.push(h1("4. Notification system"))
  c.push(h2("4.1 Evaluation engine"))
  c.push(p("lib/notifications/evaluate.ts calls getExecutiveSummary(), compares each KPI and the portfolio against the last stored snapshot, and creates deduplicated alert events on worsening, recovery, or band-change transitions. The first run records a silent baseline."))
  c.push(bullet("Severity mapping: KPI red → critical, amber → warning, unavailable → warning, recovery → info; portfolio red/orange → critical, yellow → warning."))
  c.push(bullet("Deduplication: a stable fingerprint (scope | kpi | status | reporting month) prevents duplicate alerts on re-runs."))
  c.push(bullet("Fan-out: each event creates one delivery per matching subscription and enabled channel; dashboard deliveries are immediate."))
  c.push(h2("4.2 Database tables (Azure PostgreSQL / Drizzle)"))
  c.push(
    table(
      ["Table", "Contents"],
      [
        ["app_user", "Identity + RBAC role (viewer / manager / admin)."],
        ["subscription", "Per-user KPI or portfolio follow, channel toggles, min severity."],
        ["alert_event", "Generated alerts with severity, transition, and dedupe key."],
        ["delivery", "Per-user, per-channel delivery + read state."],
        ["kpi_status_snapshot", "Last-seen status per scope/KPI for transition detection."],
        ["audit_log", "Audited mutations (subscription changes, mark-read, evaluations)."],
      ],
      [2900, 6500],
    ),
  )
  c.push(h2("4.3 Triggering evaluations"))
  c.push(bullet('Manual: the "Check now" button on the Notifications page (server action).'))
  c.push(bullet("Scheduled / external: POST /api/notifications/evaluate with the NOTIFY_EVALUATE_SECRET, from Vercel Cron or Power Automate."))
  c.push(code('curl -X POST -H "x-evaluate-secret: $NOTIFY_EVALUATE_SECRET" https://<host>/api/notifications/evaluate'))

  c.push(pageBreak())
  c.push(h1("5. Enabling email & Microsoft Teams (Phase 3)"))
  c.push(p("Delivery is routed through a transport interface (lib/notifications/transports.ts). Dashboard is always on; email and Teams are stubbed behind feature flags until Microsoft 365 send permissions are configured."))
  c.push(h2("5.1 Steps"))
  c.push(step("Grant the Entra app the required Graph send permissions (e.g. Mail.Send) and configure a sender mailbox."))
  c.push(step("Set NOTIFY_EMAIL_ENABLED=true and/or NOTIFY_TEAMS_ENABLED=true."))
  c.push(step("Implement the send() body in the corresponding transport (email uses the existing Graph client token acquisition)."))
  c.push(step("Verify with a test subscription; confirm delivery rows move from suppressed to sent."))
  c.push(
    callout(
      "Power Automate compatibility",
      "Because alert creation and delivery are separated behind interfaces, Power Automate can process queued delivery records or receive a server-to-server webhook. Never expose a reusable flow URL or shared secret in browser code.",
    ),
  )

  c.push(h1("6. Cross-platform delivery"))
  c.push(p("The UI is responsive and verified on desktop and mobile widths; there is no separate mobile app to maintain."))
  c.push(
    table(
      ["Platform", "Support"],
      [
        ["Windows PC", "Latest Edge, Chrome, Firefox."],
        ["macOS", "Latest Safari, Chrome, Firefox."],
        ["iPhone / iPad", "Safari and Chrome on current iOS/iPadOS; installable to Home Screen."],
        ["Android", "Chrome on current Android; installable to Home Screen."],
      ],
      [2800, 6600],
    ),
  )
  c.push(bullet("Layout: header collapses to a menu button below the md breakpoint; KPI grids and charts reflow to a single column."))
  c.push(bullet("Charts use responsive containers, so visualizations scale to the viewport."))
  c.push(bullet("Preferences are stored per user (Azure PostgreSQL), so they follow the account across devices."))

  c.push(pageBreak())
  c.push(h1("7. Security & operations"))
  c.push(bullet("Secrets (Graph client secret, DATABASE_URL, evaluation secret) are server-side environment variables only — never shipped to the browser."))
  c.push(bullet("RBAC roles are stored on app_user and enforced on mutations; all mutations are written to audit_log."))
  c.push(bullet("Database access uses parameterized queries (Drizzle); per-user scoping is applied on user-owned data."))
  c.push(bullet("Protected endpoints (/api/revalidate, /api/notifications/evaluate) require their shared secret."))
  c.push(bullet("Recommended response headers: X-Content-Type-Options, Referrer-Policy, HSTS, and a tightened CSP for the deployed app."))
  c.push(h2("7.1 Health & monitoring"))
  c.push(bullet("GET /api/health for a basic liveness check; ?deep=1 (with REVALIDATE_SECRET) exercises the data path."))
  c.push(bullet("Watch application logs and Azure PostgreSQL metrics (Azure Monitor); alert on evaluation endpoint failures and Graph download errors."))

  c.push(h1("8. Key paths reference"))
  c.push(
    table(
      ["Path", "Responsibility"],
      [
        ["lib/xlsx-loader.ts", "Parse workbooks (SheetJS)."],
        ["lib/sharepoint/workbook-source.ts", "Graph download, cache, local fallback."],
        ["lib/kpi-data/get-rows.ts", "Sheet → typed rows."],
        ["lib/kpi-NN/", "Per-KPI calculation + dashboard data."],
        ["lib/executive-summary/", "Adapters + portfolio aggregate."],
        ["lib/notifications/", "Evaluate engine, transports, identity, queries."],
        ["lib/db/", "Azure PostgreSQL client (pg + optional Entra auth) + Drizzle schema."],
        ["app/notifications/, app/help/", "Notification centre and manuals download page."],
        ["app/api/notifications/evaluate/", "Secret-protected evaluation trigger."],
      ],
      [4000, 5400],
    ),
  )

  return new Document(docShell("CNS HIAA KPI Dashboard — IT & Technical Guide", c))
}

// ============================================================================
// DOCUMENT 3 — DESIGN & AZURE PRODUCTION DEPLOYMENT GUIDE
// ============================================================================
function buildDesignAndAzureGuide() {
  const c = []
  c.push(
    ...coverPage(
      "Design & Azure Deployment",
      "Architecture, design system, and production setup",
      "For solution architects and Azure administrators",
      NAVY,
    ),
  )

  // ---- Part A: Design ------------------------------------------------------
  c.push(h1("Part A — Design"))
  c.push(
    p(
      "This document has two parts. Part A describes how the application is designed — its architecture, data flow, and visual design system. Part B is a step-by-step guide to deploying it to Microsoft Azure for production, including Azure Database for PostgreSQL Flexible Server, Microsoft Entra ID sign-in, role-based access control (RBAC), and scheduled evaluation with Power Automate.",
    ),
  )

  c.push(h2("A1. Architecture overview"))
  c.push(
    p(
      "The dashboard is a Next.js (App Router) application rendered mostly on the server. KPI values are computed on the server from source spreadsheets and streamed to the browser as HTML, so no business logic or credentials live on the client. Persistent state for the notification system lives in PostgreSQL.",
    ),
  )
  c.push(
    table(
      ["Layer", "Technology", "Responsibility"],
      [
        ["Presentation", "Next.js RSC + Tailwind CSS", "Server-rendered dashboards, executive summary, reports, notification centre."],
        ["Application", "Next.js server actions + route handlers", "KPI computation, evaluation engine, RBAC enforcement."],
        ["Data source", "SharePoint / Microsoft Graph", "21 KPI workbooks (KPI-01 … KPI-21) with local fallback."],
        ["Persistence", "Azure Database for PostgreSQL Flexible Server", "Users, subscriptions, alert events, deliveries, audit log, status snapshots."],
        ["Identity", "Microsoft Entra ID via App Service Easy Auth", "Authentication and App Role assignment."],
        ["Hosting", "Azure App Service (Node.js)", "Runs the Next.js server in Canada East."],
      ],
      [2200, 3200, 4000],
    ),
  )

  c.push(h2("A2. Data flow: spreadsheet to visualization"))
  c.push(
    p(
      "Every KPI follows the same one-way pipeline. The workbook is the single source of record; the app never stores KPI numbers of its own.",
    ),
  )
  c.push(step("Source workbook (KPI-NN.xlsx) is maintained in SharePoint."))
  c.push(step("lib/sharepoint/workbook-source.ts downloads it via Microsoft Graph (or uses the bundled local fallback) and caches it."))
  c.push(step("lib/xlsx-loader.ts parses the workbook with SheetJS; lib/kpi-data/get-rows.ts turns the relevant sheet into typed rows."))
  c.push(step("lib/kpi-NN/ computes that KPI's status, counts, and damage points."))
  c.push(step("lib/executive-summary/ aggregates all 21 KPIs into the portfolio status."))
  c.push(step("The page renders charts and tables from that computed data; the notification engine compares it against the last snapshot."))
  c.push(
    callout(
      "Why this matters for deployment",
      "Because all 21 KPIs share this pipeline, the only data dependencies to configure in Azure are (a) access to the SharePoint workbooks via Graph and (b) the PostgreSQL connection. There is no separate ETL job to run.",
    ),
  )

  c.push(pageBreak())
  c.push(h2("A3. Visual design system"))
  c.push(
    p(
      "The interface uses a small, deliberately constrained design system so the dashboard reads as a single professional product across every device.",
    ),
  )
  c.push(h3("Color"))
  c.push(bullet("Navy (#1F2A44) — primary brand and text color used for headers, primary buttons, and emphasis."))
  c.push(bullet("Aviation blue (#2563EB) — accent for links, active navigation, and highlights."))
  c.push(bullet("Neutrals — white, light greys, and borders for surfaces and separation."))
  c.push(bullet("Status semantics — green (on target), amber (warning), red (critical), applied identically in dashboards and notifications so the two always agree."))
  c.push(h3("Typography"))
  c.push(bullet("A single sans-serif family (Geist) across headings and body, differentiated by weight and size rather than multiple typefaces."))
  c.push(bullet("Generous line height for readable, report-style density."))
  c.push(h3("Layout & responsiveness"))
  c.push(bullet("Mobile-first, flexbox-based layouts that reflow from a multi-column desktop grid to a single column on phones."))
  c.push(bullet("The top navigation collapses to a hamburger menu below the medium breakpoint; the same features are reachable on PC, Mac, iPhone, and Android."))
  c.push(bullet("A dedicated print stylesheet produces clean contract/management reports."))
  c.push(
    table(
      ["Design token", "Value", "Usage"],
      [
        ["--navy", "#1F2A44", "Primary text, headers, primary buttons."],
        ["--aviation", "#2563EB", "Links, active nav, accents."],
        ["Status: on-target", "Green", "KPI meeting target."],
        ["Status: warning", "Amber", "Attention needed."],
        ["Status: critical", "Red", "Target missed / damage incurred."],
      ],
      [2600, 2200, 4600],
    ),
  )

  // ---- Part B: Azure deployment -------------------------------------------
  c.push(pageBreak())
  c.push(h1("Part B — Azure production deployment"))
  c.push(
    p(
      "This part walks through a production deployment on Microsoft Azure, in order. Deploy all resources in the same region (Canada East is recommended) to keep data in-region and minimize latency. You will need an Azure subscription with permission to create resources and a Microsoft Entra ID administrator to register the application and assign roles.",
    ),
  )
  c.push(
    table(
      ["Azure resource", "Purpose"],
      [
        ["Resource group", "Container for all resources below (e.g. rg-cns-hiaa-kpi)."],
        ["Azure Database for PostgreSQL Flexible Server", "Notification database."],
        ["Azure App Service (Linux, Node)", "Hosts the Next.js application."],
        ["Microsoft Entra ID app registration", "Sign-in and App Roles (RBAC)."],
        ["Power Automate (or Logic Apps)", "Scheduled evaluation trigger."],
      ],
      [4600, 4800],
    ),
  )

  c.push(h2("B1. Provision Azure Database for PostgreSQL Flexible Server"))
  c.push(step("In the Azure portal, create a resource: Azure Database for PostgreSQL Flexible Server, in your resource group and in Canada East."))
  c.push(step("Choose a workload-appropriate compute tier (Burstable B1ms is enough to start; scale up later). Enable high availability if required by the contract."))
  c.push(step("Set an administrator login and strong password, or plan to use Microsoft Entra authentication (recommended — see B4)."))
  c.push(step("Under Networking, require SSL/TLS. Add a firewall rule allowing Azure services, and add the App Service outbound IPs (or use a private endpoint / VNet integration for stricter isolation)."))
  c.push(step("After creation, create a database named kpi."))
  c.push(step("Provision the schema using the bundled, idempotent DDL script (safe to re-run):"))
  c.push(code('psql "host=<server>.postgres.database.azure.com port=5432 dbname=kpi user=<admin> sslmode=require" -f scripts/db/schema.sql'))
  c.push(
    callout(
      "Schema is version-controlled",
      "scripts/db/schema.sql creates all six tables (app_user, subscription, alert_event, delivery, audit_log, kpi_status_snapshot) and their indexes. It was validated to match the application's Drizzle schema exactly, so there is no schema drift between code and database.",
    ),
  )

  c.push(pageBreak())
  c.push(h2("B2. Deploy the application to Azure App Service"))
  c.push(step("Create an Azure App Service (Linux) with a Node.js runtime, in the same resource group and region."))
  c.push(step("Configure the build/start commands for the Next.js app (build with your package manager, then start the production server)."))
  c.push(step("Deploy the code via GitHub Actions, Azure DevOps, or az webapp deploy — whichever your team standardizes on."))
  c.push(step("Add the application settings (environment variables) listed in B6, including DATABASE_URL pointing at the server from B1."))
  c.push(step("Browse to the App Service URL and confirm the dashboards render and read live KPI data before enabling authentication."))

  c.push(h2("B3. Configure Microsoft Entra ID sign-in (App Service Easy Auth)"))
  c.push(
    p(
      "Authentication is handled by Azure App Service Authentication (\"Easy Auth\"). It validates the Entra ID login before the request reaches the app and injects the signed-in principal as request headers, which the app reads in lib/auth/easy-auth.ts. No client secrets or tokens are stored in application code.",
    ),
  )
  c.push(step("In Microsoft Entra ID, register an application (or let App Service create one during the next step)."))
  c.push(step("On the App Service, open Authentication, Add identity provider, and choose Microsoft."))
  c.push(step("Point it at the Entra app registration and set Restrict access to Require authentication so unauthenticated requests are redirected to sign in."))
  c.push(step("Set the app setting AUTH_REQUIRE_ENTRA=true so the application's own proxy also redirects unauthenticated page requests (defense in depth)."))
  c.push(step("Confirm sign-in: browse to the site, authenticate with an organizational account, and verify the Profile tab shows \"Microsoft Entra ID\" as the sign-in method."))
  c.push(
    callout(
      "Local vs. production",
      "With no Easy Auth in front of the app (local development or preview), the app falls back to the NOTIFY_DEV_USER_* identity so the UI stays usable. That fallback is never used once a real Entra user is signed in.",
    ),
  )

  c.push(pageBreak())
  c.push(h2("B4. Role-based access control (RBAC) with Entra App Roles"))
  c.push(
    p(
      "Access levels are driven by Microsoft Entra App Roles. The application maps each user's assigned role to one of three internal roles and enforces it on the server; the highest matching role wins.",
    ),
  )
  c.push(step("In the Entra app registration, open App roles and create three roles."))
  c.push(
    table(
      ["Display name", "Value (suggested)", "Maps to", "Can do"],
      [
        ["Administrator", "KPI.Admin", "admin", "Everything, including assignment and audit review."],
        ["Manager", "KPI.Manager", "manager", "View all KPIs, manage own subscriptions, run evaluations."],
        ["Viewer", "KPI.Viewer", "viewer", "View all KPIs and manage own subscriptions."],
      ],
      [2200, 2200, 1500, 3600],
    ),
  )
  c.push(spacer())
  c.push(step("Under Enterprise applications, open the app, go to Users and groups, and assign users (or security groups) to the appropriate role."))
  c.push(step("The app maps any role name containing \"admin\" to admin, \"manager\" to manager, and everything else to viewer. On each sign-in the resolved role is synced to the app_user table, so directory changes take effect on the user's next login."))
  c.push(
    callout(
      "How enforcement works",
      "Privileged actions (for example, running an evaluation) call requireRole() on the server and return 403 if the user is below the required level; the UI also hides controls the user cannot use. Identity is keyed by the Entra object id (oid), so it is stable across email or name changes.",
    ),
  )

  c.push(pageBreak())
  c.push(h2("B5. Scheduled evaluation with Power Automate"))
  c.push(
    p(
      "KPI statuses are evaluated by calling a secret-protected endpoint. In production, schedule that call with Power Automate (or Azure Logic Apps) so alerts are generated automatically instead of relying on the manual \"Check now\" button.",
    ),
  )
  c.push(runs([
    new TextRun({ text: "Endpoint: ", bold: true, size: 21, color: "222933" }),
    new TextRun({ text: "POST https://<your-app>.azurewebsites.net/api/notifications/evaluate", font: "Consolas", size: 18, color: "1B2430" }),
  ]))
  c.push(runs([
    new TextRun({ text: "Auth: ", bold: true, size: 21, color: "222933" }),
    new TextRun({ text: "header x-cron-secret: <NOTIFICATIONS_CRON_SECRET>", font: "Consolas", size: 18, color: "1B2430" }),
  ]))
  c.push(spacer())
  c.push(step("In Power Automate, create a Scheduled cloud flow. Set the recurrence (for example, daily on business days at the reporting deadline time)."))
  c.push(step("Add an HTTP action: Method POST, URI set to the evaluate endpoint above."))
  c.push(step("Add a header x-cron-secret whose value is the same secret configured in the App Service setting NOTIFICATIONS_CRON_SECRET."))
  c.push(step("Save and run the flow once. A 200 response with an event summary confirms it works; the notification inbox will show any new alerts."))
  c.push(step("Optional: add a second scheduled flow for the weekly reminder cadence."))
  c.push(
    callout(
      "Baseline behaviour",
      "The very first evaluation records a silent baseline snapshot and does not raise historical alerts, so enabling the schedule will not flood users. Subsequent runs only alert on genuine status transitions and are de-duplicated per month.",
    ),
  )
  c.push(
    callout(
      "Logic Apps alternative",
      "If your organization standardizes on Azure Logic Apps, use a Recurrence trigger plus an HTTP action with the same URI and x-cron-secret header — the configuration is identical.",
    ),
  )

  c.push(pageBreak())
  c.push(h2("B6. Environment variables (App Service application settings)"))
  c.push(
    table(
      ["Setting", "Purpose"],
      [
        ["DATABASE_URL", "PostgreSQL connection string (…postgres.database.azure.com…?sslmode=require)."],
        ["AZURE_PG_USE_ENTRA", "true to authenticate to PostgreSQL with a managed-identity token instead of a password."],
        ["AZURE_PG_SSL_CA", "Optional CA bundle (PEM or file path) for verify-full TLS; blank uses Node's trust store."],
        ["AUTH_REQUIRE_ENTRA", "true in production to force Entra sign-in."],
        ["NOTIFICATIONS_CRON_SECRET", "Shared secret required by the evaluate endpoint (used by Power Automate)."],
        ["NOTIFICATIONS_EMAIL_ENABLED", "Turn on Microsoft Graph email delivery (Phase 4)."],
        ["NOTIFICATIONS_TEAMS_ENABLED", "Turn on Microsoft Teams delivery (Phase 4)."],
        ["KPI_DEFAULT_TIMEZONE", "Reporting timezone (America/Halifax)."],
        ["NOTIFY_DEV_USER_*", "Local dev fallback identity only; ignored once Entra sign-in is active."],
      ],
      [4200, 5200],
    ),
  )

  c.push(h2("B7. Go-live checklist"))
  c.push(step("PostgreSQL Flexible Server provisioned in Canada East with TLS required; schema.sql applied."))
  c.push(step("App Service deployed and reading live KPI data from SharePoint via Graph."))
  c.push(step("Easy Auth enabled with the Microsoft provider; AUTH_REQUIRE_ENTRA=true."))
  c.push(step("Three App Roles created and assigned to users or groups; role sync verified on the Profile tab."))
  c.push(step("Power Automate flow scheduled and returning 200 from the evaluate endpoint."))
  c.push(step("A test status change produces a dashboard alert; email/Teams enabled if in scope."))
  c.push(step("Data residency, backup, and high-availability settings confirmed against contract requirements."))

  return new Document(docShell("CNS HIAA KPI Dashboard — Design & Azure Deployment Guide", c))
}

// ---- write -----------------------------------------------------------------
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const userDoc = buildUserGuide()
  const itDoc = buildItGuide()
  const designDoc = buildDesignAndAzureGuide()

  const userPath = path.join(OUT_DIR, "CNS-HIAA-KPI-Dashboard-User-Guide.docx")
  const itPath = path.join(OUT_DIR, "CNS-HIAA-KPI-Dashboard-IT-Technical-Guide.docx")
  const designPath = path.join(OUT_DIR, "CNS-HIAA-KPI-Dashboard-Design-and-Azure-Deployment-Guide.docx")

  fs.writeFileSync(userPath, await Packer.toBuffer(userDoc))
  fs.writeFileSync(itPath, await Packer.toBuffer(itDoc))
  fs.writeFileSync(designPath, await Packer.toBuffer(designDoc))

  console.log("[manuals] wrote", path.relative(ROOT, userPath), `(${fs.statSync(userPath).size} bytes)`)
  console.log("[manuals] wrote", path.relative(ROOT, itPath), `(${fs.statSync(itPath).size} bytes)`)
  console.log("[manuals] wrote", path.relative(ROOT, designPath), `(${fs.statSync(designPath).size} bytes)`)
}

main().catch((err) => {
  console.error("[manuals] failed:", err)
  process.exit(1)
})
