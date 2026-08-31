/**
 * Generates the "CNS HIAA KPI Dashboard - SharePoint Data Linking Guide" as a
 * Word (.docx) document into public/ so it can be downloaded from the app.
 *
 * Run: node scripts/gen-sharepoint-guide.mjs
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
} from "docx"
import { writeFileSync, mkdirSync, existsSync } from "node:fs"
import { join } from "node:path"

const NAVY = "1E3A5F"
const ORANGE = "E8622C"
const GREY = "6B7280"
const LIGHT = "F3F4F6"

// ---- small helpers --------------------------------------------------------

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
    children: [new TextRun({ text, bold: true, color: ORANGE, size: 26 })],
  })
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 288 },
    children: [new TextRun({ text, size: 22, ...opts })],
  })
}

function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 60, line: 276 },
    children: parseInline(text),
  })
}

function step(n, text) {
  return new Paragraph({
    numbering: { reference: "steps", level: 0 },
    spacing: { after: 80, line: 276 },
    children: parseInline(text),
  })
}

// Parse **bold** and `code` inline markers into runs.
function parseInline(text) {
  const runs = []
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let last = 0
  let m
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) runs.push(new TextRun({ text: text.slice(last, m.index), size: 22 }))
    const tok = m[0]
    if (tok.startsWith("**")) {
      runs.push(new TextRun({ text: tok.slice(2, -2), bold: true, size: 22 }))
    } else {
      runs.push(
        new TextRun({ text: tok.slice(1, -1), font: "Consolas", size: 20, color: NAVY }),
      )
    }
    last = regex.lastIndex
  }
  if (last < text.length) runs.push(new TextRun({ text: text.slice(last), size: 22 }))
  return runs.length ? runs : [new TextRun({ text, size: 22 })]
}

function cell(text, { header = false, width } = {}) {
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: header
      ? { type: ShadingType.CLEAR, color: "auto", fill: NAVY }
      : { type: ShadingType.CLEAR, color: "auto", fill: "FFFFFF" },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [
      new Paragraph({
        children: parseInline(text).map(
          (r) =>
            new TextRun({
              ...r,
              // header rows: white bold
            }),
        ),
      }),
    ],
  })
}

function headerCell(text, width) {
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: { type: ShadingType.CLEAR, color: "auto", fill: NAVY },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 20 })] })],
  })
}

function bodyCell(text, width, fill = "FFFFFF") {
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: { type: ShadingType.CLEAR, color: "auto", fill },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: parseInline(text).map((r) => new TextRun({ ...r, size: 20 })) })],
  })
}

function table(headers, rows, widths) {
  const border = { style: BorderStyle.SINGLE, size: 4, color: "D1D5DB" }
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: border,
      bottom: border,
      left: border,
      right: border,
      insideHorizontal: border,
      insideVertical: border,
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => headerCell(h, widths?.[i])),
      }),
      ...rows.map(
        (r, ri) =>
          new TableRow({
            children: r.map((c, i) => bodyCell(c, widths?.[i], ri % 2 ? LIGHT : "FFFFFF")),
          }),
      ),
    ],
  })
}

function spacer() {
  return new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "" })] })
}

function note(text) {
  return new Paragraph({
    spacing: { before: 80, after: 120, line: 276 },
    shading: { type: ShadingType.CLEAR, color: "auto", fill: "FDF1E7" },
    border: {
      left: { style: BorderStyle.SINGLE, size: 18, color: ORANGE, space: 8 },
    },
    children: [new TextRun({ text: "Note: ", bold: true, color: ORANGE, size: 22 }), ...parseInline(text)],
  })
}

// ---- content --------------------------------------------------------------

const children = []

// Cover
children.push(
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 60 },
    children: [new TextRun({ text: "CNS HIAA", bold: true, color: ORANGE, size: 40 })],
  }),
  new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: "KPI Dashboard - SharePoint Data Linking Guide", bold: true, color: NAVY, size: 34 })],
  }),
  new Paragraph({
    spacing: { after: 240 },
    children: [
      new TextRun({
        text: "How to connect the KPI-01 through KPI-21 spreadsheets in the HIAA KPI SharePoint site to the live dashboard application.",
        italics: true,
        color: GREY,
        size: 22,
      }),
    ],
  }),
)

// Overview
children.push(h1("1. How the connection works"))
children.push(
  p(
    "The dashboard application does not store its own copy of the KPI numbers. Each dashboard reads the underlying Excel workbook at request time and renders the charts and tables from whatever is currently in that file. When you update a spreadsheet in SharePoint, the dashboard reflects the change automatically (within the refresh window described in Section 6).",
  ),
)
children.push(p("For every KPI the app resolves data in this order:", { bold: true }))
children.push(bullet("**1. SharePoint (preferred).** When the SharePoint credentials are present, the app downloads each `kpi-NN.xlsx` file from the HIAA KPI site's document library through Microsoft Graph. It resolves files by site + folder path, so no browser \"Copy link\" URL (the `Doc.aspx?sourcedoc={GUID}` kind) is ever needed."))
children.push(bullet("**2. Local fallback.** If SharePoint is not configured, or a download fails, the app uses a bundled copy of each workbook so the site never goes blank."))
children.push(
  note(
    "This means the app is safe to deploy today on the fallback data. The moment the environment variables in Section 4 are added, every dashboard switches to live SharePoint data with no code change and no rebuild required.",
  ),
)

// Prerequisites
children.push(h1("2. What you need before you start"))
children.push(bullet("A **SharePoint Online** site for the HIAA KPIs (yours is `https://commissionairesns.sharepoint.com/sites/HIAAKPIs`)."))
children.push(bullet("**Microsoft Entra ID (Azure AD) admin rights**, or help from someone who can register an app and grant admin consent."))
children.push(bullet("**Owner/Manager access** to the dashboard project's environment variable settings (to paste the credentials)."))
children.push(bullet("The 21 KPI workbooks, one Excel file per KPI."))

// Part A - SharePoint folder structure
children.push(h1("3. Step 1 - Confirm the SharePoint file layout"))
children.push(
  p(
    "The app reads each workbook from the HIAA KPI site's document library by file name. The file names must match exactly. The default layout is flat - all 21 files sit directly in one library - which matches how your files are currently stored (for example the link `.../HIAAKPIs/.../file=kpi-01.xlsx`).",
  ),
)
children.push(step(1, "Open the **HIAA KPI** SharePoint site (`https://commissionairesns.sharepoint.com/sites/HIAAKPIs`) and go to the **Documents** library."))
children.push(step(2, "Place all **21 workbooks** in that library, named exactly: `kpi-01.xlsx`, `kpi-02.xlsx`, `kpi-03.xlsx`, ... through `kpi-21.xlsx` (lower-case, with a hyphen, `.xlsx` extension)."))
children.push(step(3, "If the files live inside a sub-folder of the library (for example a Teams channel folder such as **General**, or a **KPI Dashboards** folder), note that folder name - it becomes the `SHAREPOINT_BASE_PATH` value in Section 5. If they sit at the top level, leave that value blank."))
children.push(step(4, "Confirm every file uses the `.xlsx` extension (not `.xls` or `.xlsm`)."))
children.push(
  note(
    "Do not rename the worksheet tabs or the column headers inside the workbooks. Each dashboard reads specific sheet names and columns; renaming them will break parsing even though the file name is correct. It is safe to add or change the data rows - that is the whole point.",
  ),
)
children.push(spacer())
children.push(p("The default (flat) layout looks like this:", { bold: true }))
children.push(p("Documents / kpi-01.xlsx", { font: "Consolas", size: 20, color: NAVY }))
children.push(p("Documents / kpi-02.xlsx", { font: "Consolas", size: 20, color: NAVY }))
children.push(p("...", { font: "Consolas", size: 20, color: NAVY }))
children.push(p("Documents / kpi-21.xlsx", { font: "Consolas", size: 20, color: NAVY }))
children.push(spacer())
children.push(
  note(
    "If your files are instead nested one-folder-per-KPI (kpi-01/kpi-01.xlsx), you do not need to move them - just set `SHAREPOINT_FILE_TEMPLATE` to `{id}/{id}.xlsx` in Section 5. The `{id}` placeholder expands to kpi-01 ... kpi-21.",
  ),
)

// Part B - Entra app registration
children.push(h1("4. Step 2 - Register an app for secure read access"))
children.push(
  p(
    "The dashboard reads SharePoint using an app-only (client credentials) connection to Microsoft Graph. You register an application once, give it read access to the site, and generate a secret.",
  ),
)
children.push(h2("4.1 Create the app registration"))
children.push(step(1, "Go to the **Microsoft Entra admin center** (entra.microsoft.com) > **Identity** > **Applications** > **App registrations** > **New registration**."))
children.push(step(2, "Name it, for example, **CNS HIAA KPI Dashboard**. Leave the default single-tenant option and click **Register**."))
children.push(step(3, "On the app's **Overview** page, copy the **Directory (tenant) ID** and the **Application (client) ID**. You will paste these in Section 5."))
children.push(h2("4.2 Create a client secret"))
children.push(step(1, "Open **Certificates & secrets** > **Client secrets** > **New client secret**."))
children.push(step(2, "Give it a description and an expiry (for example 24 months), then click **Add**."))
children.push(step(3, "Immediately copy the secret **Value** (not the Secret ID). It is shown only once. This is `SHAREPOINT_CLIENT_SECRET`."))
children.push(note("Set a calendar reminder before the secret expires. When it expires, live data stops and the app falls back to the bundled workbooks until a new secret is added."))
children.push(h2("4.3 Grant read permission to SharePoint"))
children.push(p("Choose one of the two options below. Option A is simplest; Option B is the least-privilege choice preferred by many security teams.", {}))
children.push(p("Option A - read all sites (simplest):", { bold: true }))
children.push(step(1, "Open **API permissions** > **Add a permission** > **Microsoft Graph** > **Application permissions**."))
children.push(step(2, "Add **Sites.Read.All**."))
children.push(step(3, "Click **Grant admin consent for <your organization>** and confirm. The status must show a green check."))
children.push(spacer())
children.push(p("Option B - restrict to just the HIAA KPI site (least privilege):", { bold: true }))
children.push(step(1, "In API permissions add the Graph application permission **Sites.Selected**, then **Grant admin consent**."))
children.push(step(2, "Have a SharePoint administrator grant this specific app **read** access to the HIAA KPI site (done via the Graph `sites/{site-id}/permissions` endpoint or the SharePoint admin PnP tooling). Provide them the Application (client) ID from step 4.1."))
children.push(note("With Option B, if the app can authenticate but cannot see the files, it means the per-site grant in step 2 has not been completed. The dashboards will fall back to local data until it is."))

// Part C - env vars
children.push(h1("5. Step 3 - Add the connection settings to the app"))
children.push(
  p(
    "The app is self-hosted on your own infrastructure (no Vercel or external cloud). Add the following settings to the server's environment - typically an `.env.production.local` file next to the app, or your service/container environment configuration - then restart the app.",
  ),
)
children.push(spacer())
children.push(
  table(
    ["Variable", "Required", "What to enter / where it comes from"],
    [
      ["SHAREPOINT_TENANT_ID", "Yes", "Directory (tenant) ID from Section 4.1."],
      ["SHAREPOINT_CLIENT_ID", "Yes", "Application (client) ID from Section 4.1."],
      ["SHAREPOINT_CLIENT_SECRET", "Yes", "The secret Value from Section 4.2."],
      [
        "SHAREPOINT_SITE_URL",
        "Yes",
        "The plain site URL: https://commissionairesns.sharepoint.com/sites/HIAAKPIs (NOT a browser Copy-link / Doc.aspx URL).",
      ],
      [
        "SHAREPOINT_FILE_TEMPLATE",
        "Optional",
        "File-name layout. Default {id}.xlsx (flat). Set to {id}/{id}.xlsx if each KPI is in its own folder. {id} expands to kpi-01 ... kpi-21.",
      ],
      [
        "SHAREPOINT_BASE_PATH",
        "Optional",
        "Sub-folder inside the library that holds the files (e.g. General). Leave blank if the files sit at the root of the Documents library.",
      ],
      [
        "KPI_CACHE_SECONDS",
        "Optional",
        "Refresh window in seconds (default 300). Keep high with the webhook (Section 7); set low (e.g. 60) for simple poll-only refresh with no webhook.",
      ],
      [
        "REVALIDATE_SECRET",
        "Optional",
        "Any long random string. Only needed for the instant-refresh webhook in Section 7.",
      ],
    ],
    [26, 12, 62],
  ),
)
children.push(spacer())
children.push(step(1, "Paste each value carefully - no leading/trailing spaces, and do not wrap values in quotes."))
children.push(step(2, "Save the settings, then **rebuild and restart** the application (`pnpm build` then `pnpm start`, or restart the service/container) so the new settings take effect."))

// Part D - verify
children.push(h1("6. Step 4 - Verify the live connection"))
children.push(step(1, "Open any dashboard, for example **/kpi/kpi-01**, and confirm it loads without error."))
children.push(step(2, "In SharePoint, make a small visible change to that KPI's workbook (for example change a value), and save."))
children.push(step(3, "Wait up to 5 minutes (the standard refresh window) and reload the dashboard - the change should appear. For an immediate check, use the instant-refresh webhook below."))
children.push(step(4, "Optionally open the live download link **/api/kpi/kpi-01/xlsx** - it should download the current SharePoint file. This link is never cached, so it always matches SharePoint exactly."))
children.push(
  note(
    "How refresh works: dashboards are cached and rebuilt at most every 5 minutes (incremental static regeneration). That keeps the site fast while staying current. The webhook in the next section is optional and only needed when you want changes to appear within seconds.",
  ),
)

// Part E - Power Automate
children.push(h1("7. Optional - Instant refresh with Power Automate"))
children.push(
  p(
    "If you want a dashboard to update within seconds of someone saving the spreadsheet (instead of waiting for the 5-minute window), set up a Power Automate flow that calls the app's refresh webhook whenever a file changes.",
  ),
)
children.push(step(1, "Set the `REVALIDATE_SECRET` environment variable (Section 5) to a long random string and restart the app."))
children.push(step(2, "Confirm the app is reachable from Power Automate. If it is hosted on the internal network only, use an on-premises data gateway or an internally-resolvable URL. You can verify reachability with a browser GET to `https://<your-internal-app-host>/api/revalidate`, which returns a small health-check JSON (it does not trigger a refresh)."))
children.push(step(3, "In **Power Automate**, create an automated cloud flow using the SharePoint trigger **When a file is created or modified (properties only)**, pointed at the HIAA KPI Documents library."))
children.push(step(4, "Add an **HTTP** action with these settings:"))
children.push(bullet("**Method:** POST", 1))
children.push(bullet("**URI:** https://<your-internal-app-host>/api/revalidate", 1))
children.push(bullet("**Headers:** `x-revalidate-secret` = the REVALIDATE_SECRET value; and `Content-Type` = `application/json`", 1))
children.push(bullet("**Body (easiest):** `{ \"fileName\": \"@{triggerOutputs()?['body/{FilenameWithExtension}']}\" }` - the app derives the KPI id from the file name automatically (e.g. kpi-07.xlsx becomes kpi-07).", 1))
children.push(bullet("**Body (explicit):** `{ \"kpiId\": \"kpi-01\" }` to refresh one KPI, or `{}` to refresh all dashboards.", 1))
children.push(step(5, "Because the app derives the id from the modified file's name (or full path), a single flow covers all 21 files with no per-KPI branching. A file whose name has no kpi-NN pattern is safely ignored."))
children.push(
  note(
    "The webhook accepts the secret via the `x-revalidate-secret` header or a `?secret=` query parameter. It returns 401 if the secret is wrong, 400 if no KPI id could be determined, 404 for an unknown kpiId, and 503 if REVALIDATE_SECRET has not been set on the app. A GET to the same URL is a no-refresh health check.",
  ),
)

// Troubleshooting
children.push(h1("8. Troubleshooting"))
children.push(
  table(
    ["Symptom", "Likely cause and fix"],
    [
      [
        "Dashboards still show old/sample numbers after setup",
        "The app is on local fallback. Confirm all four required variables in Section 5 are set in the server environment and that you rebuilt/restarted the app. Check the server logs for a line starting with \"SharePoint fetch failed\".",
      ],
      [
        "\"SharePoint file download failed ... (404)\"",
        "File name/path mismatch. Verify the exact names kpi-NN.xlsx, that SHAREPOINT_FILE_TEMPLATE matches your layout (flat vs folder-per-KPI), and that SHAREPOINT_BASE_PATH matches the sub-folder (or is blank).",
      ],
      [
        "\"site lookup failed\" or (403)",
        "Permissions issue. Confirm admin consent was granted for Sites.Read.All (Option A), or that the per-site grant was completed (Option B). Confirm SHAREPOINT_SITE_URL is the full correct site URL.",
      ],
      [
        "\"token request failed\" (401)",
        "Wrong tenant ID, client ID, or an expired/incorrect client secret. Re-copy the values; generate a new secret if needed.",
      ],
      [
        "A single KPI is blank while others work",
        "That one workbook's tab names or column headers were changed, or the file is not a valid .xlsx. Restore the original sheet/column names.",
      ],
      [
        "Changes take a few minutes to appear",
        "Expected - that is the 5-minute refresh window. Use the Power Automate webhook (Section 7) for instant updates.",
      ],
    ],
    [38, 62],
  ),
)

// Appendix
children.push(h1("Appendix A - Required file names for all 21 KPIs"))
children.push(p("Every KPI follows the same flat pattern (the default). The \"Full SharePoint path\" column assumes the files sit at the root of the Documents library; insert your SHAREPOINT_BASE_PATH sub-folder before the file name if you use one.", {}))
children.push(spacer())

const kpiRows = []
for (let i = 1; i <= 21; i++) {
  const id = `kpi-${String(i).padStart(2, "0")}`
  kpiRows.push([`KPI-${String(i).padStart(2, "0")}`, `${id}.xlsx`, `sites/HIAAKPIs/Documents/${id}.xlsx`])
}
children.push(table(["KPI", "File name", "Full SharePoint path"], kpiRows, [14, 26, 60]))

children.push(h1("Appendix B - Application endpoints"))
children.push(
  table(
    ["Endpoint", "Purpose"],
    [
      ["/kpi/kpi-NN", "The dashboard page for a given KPI (reads live SharePoint data)."],
      ["/reports", "Consolidated report across all KPIs."],
      ["/api/kpi/kpi-NN/xlsx", "Live, uncached download of the current workbook straight from SharePoint."],
      ["/api/revalidate", "POST webhook to force an instant refresh (see Section 7)."],
    ],
    [34, 66],
  ),
)

// ---- build ---------------------------------------------------------------

const doc = new Document({
  creator: "CNS HIAA",
  title: "CNS HIAA KPI Dashboard - SharePoint Data Linking Guide",
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: 22, color: "1F2937" },
      },
    },
  },
  numbering: {
    config: [
      {
        reference: "steps",
        levels: [
          {
            level: 0,
            format: "decimal",
            text: "%1.",
            alignment: AlignmentType.START,
            style: { paragraph: { indent: { left: 460, hanging: 300 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: { page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } },
      children,
    },
  ],
})

const outDir = join(process.cwd(), "public")
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
const outPath = join(outDir, "CNS-HIAA-SharePoint-Setup-Guide.docx")
const buffer = await Packer.toBuffer(doc)
writeFileSync(outPath, buffer)
console.log(`Wrote ${outPath} (${buffer.length} bytes)`)
