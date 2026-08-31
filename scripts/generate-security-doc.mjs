/**
 * Generates the HIAA KPI Dashboard security go-live guide as a .docx.
 * Run: node scripts/generate-security-doc.mjs
 * Output: public/HIAA-KPI-Security-Go-Live-Guide.docx
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
  AlignmentType,
  BorderStyle,
  ShadingType,
} from "docx"
import { writeFileSync, mkdirSync } from "node:fs"

const NAVY = "1A2540"
const ACCENT = "B44A1E"
const GREY = "5B6472"
const LIGHT = "EEF1F5"

// ---------- small helpers ----------
const H1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 140 },
    children: [new TextRun({ text, bold: true, color: NAVY, size: 30 })],
  })

const H2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [new TextRun({ text, bold: true, color: NAVY, size: 26 })],
  })

const H3 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    children: [new TextRun({ text, bold: true, color: ACCENT, size: 23 })],
  })

const P = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: 120, line: 276 },
    children: [new TextRun({ text, size: 21, ...opts })],
  })

const Bullet = (text, level = 0) =>
  new Paragraph({
    bullet: { level },
    spacing: { after: 60, line: 264 },
    children: Array.isArray(text) ? text : [new TextRun({ text, size: 21 })],
  })

const Num = (text, ref, level = 0) =>
  new Paragraph({
    numbering: { reference: ref, level },
    spacing: { after: 80, line: 268 },
    children: Array.isArray(text) ? text : [new TextRun({ text, size: 21 })],
  })

const Code = (text) =>
  new Paragraph({
    spacing: { after: 100, before: 40 },
    shading: { type: ShadingType.CLEAR, fill: "F3F4F6" },
    border: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "D9DEE5" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "D9DEE5" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "D9DEE5" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "D9DEE5" },
    },
    children: [new TextRun({ text, font: "Consolas", size: 19, color: "111827" })],
  })

const run = (text, opts = {}) => new TextRun({ text, size: 21, ...opts })
const bold = (text) => new TextRun({ text, size: 21, bold: true })
const mono = (text) => new TextRun({ text, font: "Consolas", size: 19, color: "9A3412" })

// ---------- tables ----------
function tableHeaderCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: NAVY },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 20 })] })],
  })
}

function tableCell(children, width, fill) {
  const kids = Array.isArray(children) ? children : [children]
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: fill ? { type: ShadingType.CLEAR, fill } : undefined,
    margins: { top: 50, bottom: 50, left: 100, right: 100 },
    children: kids.map((c) =>
      typeof c === "string"
        ? new Paragraph({ children: [new TextRun({ text: c, size: 19 })] })
        : c,
    ),
  })
}

function makeTable(headers, rows, widths) {
  const border = { style: BorderStyle.SINGLE, size: 2, color: "D9DEE5" }
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => tableHeaderCell(h, widths[i])),
      }),
      ...rows.map((r, ri) =>
        new TableRow({
          children: r.map((c, i) => tableCell(c, widths[i], ri % 2 ? LIGHT : "FFFFFF")),
        }),
      ),
    ],
  })
}

const spacer = () => new Paragraph({ spacing: { after: 80 }, children: [] })

// ================= DOCUMENT CONTENT =================
const children = []

// ---- Cover ----
children.push(
  new Paragraph({
    spacing: { before: 1600, after: 100 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "CNS HIAA", bold: true, color: ACCENT, size: 30 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text: "Airport KPI Dashboard", bold: true, color: NAVY, size: 56 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [new TextRun({ text: "Security Hardening & Go-Live Guide", color: NAVY, size: 34 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 40 },
    children: [new TextRun({ text: "Microsoft Entra ID authentication • Role-Based Access Control", color: GREY, size: 22 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1200 },
    children: [new TextRun({ text: "Document classification: Internal — Operations & IT Security", italics: true, color: GREY, size: 20 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Version 1.0", color: GREY, size: 20 })],
  }),
  new Paragraph({ pageBreakBefore: true, children: [] }),
)

// ---- 1. Purpose ----
children.push(
  H1("1. Purpose & Scope"),
  P("This document is the authoritative, step-by-step procedure for taking the CNS HIAA Airport KPI Dashboard from its current development configuration to a secured, publicly reachable production deployment protected by Microsoft Entra ID (Azure AD) and application role-based access control (RBAC)."),
  P("It is written so that an IT administrator with Azure portal access — but no prior knowledge of the application internals — can complete every task in order. Each section states WHAT to do, WHERE to do it, and HOW to verify it worked before moving on."),
  H3("What this application is"),
  Bullet("A Next.js (App Router, standalone output) portal presenting 21 operational KPI dashboards plus an Executive Summary, Reports, and a Notifications/alerts system."),
  Bullet("Source data is read server-side from SharePoint (Microsoft Graph) with a bundled local workbook fallback. The browser never receives SharePoint or Graph credentials."),
  Bullet("Identity is provided by Microsoft Entra ID using an interactive browser (MSAL) login. Authorization uses three hierarchical roles: viewer ⊆ manager ⊆ admin."),
  H3("Security model in one paragraph"),
  P("The browser signs in with MSAL and obtains an access token scoped to this app's own Web API. That token is POSTed once to /api/auth/session, where the server cryptographically verifies it against Entra's published keys (signature, issuer, audience, expiry). On success the server mints its OWN short-lived, signed, httpOnly session cookie. Every page, API route, and server action then reads the already-verified identity from that cookie — the raw Entra token is never stored and is never exposed to client JavaScript."),
)

// ---- 2. Security posture summary ----
children.push(
  H1("2. Current Security Posture (What Is Already Done)"),
  P("The following controls are already implemented in code. You do not need to build them — but you must CONFIGURE and VERIFY them as described later."),
  makeTable(
    ["Control", "Status", "Where"],
    [
      ["Entra token verification (signature/issuer/audience/expiry)", "Implemented", "lib/auth/token.ts"],
      ["Signed httpOnly session cookie (HS256, 8h TTL)", "Implemented", "lib/auth/session.ts"],
      ["Page-level presence gate → redirect to /login", "Implemented", "proxy.ts"],
      ["RBAC role hierarchy (viewer/manager/admin)", "Implemented", "lib/notifications/types.ts, rbac.ts"],
      ["Server-action RBAC (e.g. run evaluation = manager)", "Implemented", "app/actions/notifications.ts"],
      ["API route RBAC guard (401 vs 403)", "Implemented", "lib/auth/guard.ts"],
      ["Source-workbook download requires sign-in", "Implemented", "app/api/kpi/[id]/xlsx/route.ts"],
      ["Machine endpoints gated by shared secret", "Implemented", "revalidate, evaluate, diagnose routes"],
      ["Baseline security response headers", "Implemented", "next.config.mjs"],
      ["Fail-closed when auth misconfigured", "Implemented", "api/auth/session, api/notifications/evaluate"],
    ],
    [52, 18, 30],
  ),
  spacer(),
  P("The remaining work is configuration in the Azure portal, setting environment variables, switching the app into enforced (MSAL) mode, tightening the Content-Security-Policy from report-only to enforced, and completing the verification and sign-off steps.", { italics: true }),
)

// ---- 3. Pre-reqs ----
children.push(
  H1("3. Prerequisites"),
  Bullet("An Azure subscription and permission to create an App Registration in the target Entra tenant (Application Administrator or Global Administrator)."),
  Bullet("The production hostname the app will be served from over HTTPS (for example https://kpi.hiaa.ca). A valid TLS certificate must be in place before go-live."),
  Bullet("Access to set environment variables / application settings on the hosting platform (Azure App Service, Windows service, container, or reverse-proxied Node host)."),
  Bullet("The SharePoint site URL and document path where the KPI workbooks live, and permission to grant an app registration read access to that site."),
  Bullet("A password manager or secrets vault (e.g. Azure Key Vault) to store generated secrets."),
)

// ---- 4. Entra App Registration ----
children.push(
  H1("4. Step-by-Step: Microsoft Entra ID App Registration"),
  P("This creates the identity the browser signs into. It is a PUBLIC client (no client secret is used for the interactive login)."),
  H3("4.1 Create the registration"),
  Num("In the Azure portal go to Microsoft Entra ID → App registrations → New registration.", "steps1"),
  Num("Name it clearly, e.g. \"HIAA KPI Dashboard\".", "steps1"),
  Num("Supported account types: Accounts in this organizational directory only (single tenant).", "steps1"),
  Num([mono("Redirect URI"), run(": select Single-page application (SPA) and enter your production login URL, e.g. "), mono("https://kpi.hiaa.ca/login"), run(".")], "steps1"),
  Num("Click Register. Copy the Application (client) ID and Directory (tenant) ID from the Overview page — you will need both.", "steps1"),
  H3("4.2 Add all redirect URIs you use"),
  P("Under Authentication → Single-page application, add every origin that will host the app so logins are not rejected:"),
  Bullet([mono("https://kpi.hiaa.ca/login"), run("  (production)")]),
  Bullet([mono("http://localhost:3000/login"), run("  (local development, optional)")]),
  P("Enable \"ID tokens\" is NOT required for this app (we use an access token for our own API). Leave implicit grant checkboxes unchecked.", { italics: true }),
  H3("4.3 Expose an API (this is what makes the roles claim appear)"),
  Num("Go to Expose an API → Add → set the Application ID URI to the default api://<client-id> (Save).", "steps2"),
  Num("Add a scope: Scope name = access_as_user; Who can consent = Admins and users; fill the consent display strings; State = Enabled; Add.", "steps2"),
  Num([run("The app requests the scope "), mono("api://<client-id>/access_as_user"), run(". The resulting access token has an "), mono("aud"), run(" of your API and carries the assigned App Roles in its "), mono("roles"), run(" claim.")], "steps2"),
  H3("4.4 Define App Roles"),
  P("Go to App roles → Create app role, and create these three (Allowed member types: Users/Groups):"),
  makeTable(
    ["Display name", "Value (exact)", "Grants"],
    [
      ["KPI Viewer", "KPI.Viewer", "View dashboards; manage own alert subscriptions."],
      ["KPI Manager", "KPI.Manager", "Viewer + run evaluations and acknowledge alerts."],
      ["KPI Administrator", "KPI.Admin", "Full access incl. assignment and audit review."],
    ],
    [26, 26, 48],
  ),
  spacer(),
  P([bold("How the value maps to a role: "), run("the app matches case-insensitively and tolerates prefixes — any value containing \"admin\" → admin, \"manager\" → manager, otherwise → viewer (see lib/auth/roles.ts). So \"KPI.Admin\", \"Portfolio.Manager\", etc. all work.")]),
  H3("4.5 Assign people to roles"),
  Num("Go to Microsoft Entra ID → Enterprise applications → find \"HIAA KPI Dashboard\" → Users and groups.", "steps3"),
  Num("Add user/group → pick the person → select the App Role (Viewer / Manager / Administrator) → Assign.", "steps3"),
  Num("Strongly recommended: set Enterprise application → Properties → \"Assignment required?\" = Yes. This blocks anyone in the tenant who has not been explicitly assigned a role from signing in at all.", "steps3"),
  P([bold("Least privilege: "), run("assign Administrator to as few people as possible. Most users should be Viewer. Only operations leads who run evaluations need Manager.")]),
)

// ---- 5. Environment variables ----
children.push(
  H1("5. Step-by-Step: Environment Variables"),
  P("Set these on the production host. Values prefixed NEXT_PUBLIC_ are compiled into the browser bundle and are NOT secret by design (MSAL is a public client). Everything else is server-only and must be treated as a secret."),
  H3("5.1 Authentication — required to enforce login"),
  makeTable(
    ["Variable", "Secret?", "Example / notes"],
    [
      [[mono("NEXT_PUBLIC_AUTH_MODE")], "No", "Set to msal to ENFORCE Entra login. Any other value = dev fallback."],
      [[mono("NEXT_PUBLIC_AZURE_CLIENT_ID")], "No", "Application (client) ID from step 4.1."],
      [[mono("NEXT_PUBLIC_AZURE_TENANT_ID")], "No", "Directory (tenant) ID from step 4.1."],
      [[mono("NEXT_PUBLIC_AZURE_API_SCOPE")], "No", "api://<client-id>/access_as_user (optional; derived if unset)."],
      [[mono("NEXT_PUBLIC_AZURE_REDIRECT_URI")], "No", "https://kpi.hiaa.ca/login (optional; defaults to /login)."],
      [[mono("NEXT_PUBLIC_AZURE_POST_LOGOUT_URI")], "No", "Optional post-logout landing page."],
      [[mono("AZURE_TENANT_ID")], "No*", "Server-side token issuer pin. Same tenant GUID."],
      [[mono("AZURE_CLIENT_ID")], "No*", "Server-side audience check. Same client ID."],
      [[mono("AZURE_API_AUDIENCE")], "No", "Override only if using a custom Application ID URI."],
      [[mono("SESSION_SECRET")], "YES", "Min 16 chars; use 32+ random bytes. Signs the session cookie."],
    ],
    [40, 12, 48],
  ),
  spacer(),
  P("*AZURE_TENANT_ID / AZURE_CLIENT_ID are not sensitive, but they MUST be present server-side or token verification fails closed (the app refuses logins rather than trusting an unverified token)."),
  H3("5.2 SharePoint / Microsoft Graph — server-only secrets"),
  makeTable(
    ["Variable", "Secret?", "Notes"],
    [
      [[mono("SHAREPOINT_TENANT_ID")], "No", "Tenant for the Graph app registration."],
      [[mono("SHAREPOINT_CLIENT_ID")], "No", "App registration used for Graph (can be separate from login app)."],
      [[mono("SHAREPOINT_CLIENT_SECRET")], "YES", "Client secret / certificate for Graph. Store in Key Vault."],
      [[mono("SHAREPOINT_SITE_URL")], "No", "e.g. https://contoso.sharepoint.com/sites/HIAA-KPIs."],
      [[mono("SHAREPOINT_BASE_PATH")], "No", "Document library path prefix to the workbooks."],
      [[mono("SHAREPOINT_FILE_TEMPLATE")], "No", "File naming template, e.g. {kpi}.xlsx."],
      [[mono("SHAREPOINT_TIMEOUT_MS / _MAX_RETRIES")], "No", "Optional resiliency tuning."],
    ],
    [42, 12, 46],
  ),
  spacer(),
  H3("5.3 Machine endpoint secrets & data"),
  makeTable(
    ["Variable", "Secret?", "Protects"],
    [
      [[mono("SESSION_SECRET")], "YES", "Session cookie signing (repeated here as critical)."],
      [[mono("REVALIDATE_SECRET")], "YES", "/api/revalidate cache refresh + /api/sharepoint/diagnose."],
      [[mono("NOTIFICATIONS_CRON_SECRET")], "YES", "/api/notifications/evaluate scheduled run."],
      [[mono("DATABASE_URL")], "YES", "Postgres connection string (notifications/audit store)."],
    ],
    [40, 12, 48],
  ),
  spacer(),
  P([bold("Remove the dev backdoor in production. "), run("Do NOT set any of DEV_IDENTITY_* or NOTIFY_DEV_USER_* variables in production. Those only apply when NEXT_PUBLIC_AUTH_MODE is not \"msal\". With MSAL mode on they are ignored, but leaving them unset avoids any confusion.")]),
  H3("5.4 Generate strong secrets"),
  P("On any machine with OpenSSL (or Git Bash on Windows):"),
  Code("openssl rand -base64 48"),
  P("Generate a distinct value for each of SESSION_SECRET, REVALIDATE_SECRET, and NOTIFICATIONS_CRON_SECRET. Never reuse one secret for two purposes, and never commit them to source control."),
)

// ---- 6. Enable enforced mode ----
children.push(
  H1("6. Step-by-Step: Switch the App Into Enforced (MSAL) Mode"),
  Num([run("Confirm all of section 5.1 is set, especially "), mono("NEXT_PUBLIC_AUTH_MODE=msal"), run(", plus a strong "), mono("SESSION_SECRET"), run(".")], "steps4"),
  Num("Redeploy / restart the app so the NEXT_PUBLIC_ values are compiled into the bundle (these are build-time on the client).", "steps4"),
  Num("Load the site in a private browser window. You should be redirected to /login and see \"Sign in with Microsoft\".", "steps4"),
  Num("Sign in with an assigned account. You should land back on the intended page; your name and role appear in the header.", "steps4"),
  Num("Sign in with an unassigned account (if \"Assignment required\" = Yes) — Entra should refuse access.", "steps4"),
  P([bold("Fail-closed behavior to expect: "), run("if AZURE_TENANT_ID / AZURE_CLIENT_ID are missing server-side, /api/auth/session returns 503 and no session is issued — the app will not silently fall back to an unauthenticated state.")]),
)

// ---- 7. API route protection ----
children.push(
  H1("7. API Route Protection Reference"),
  P("Every route enforces its own auth (the page proxy deliberately does not guard /api). Use this table to verify each endpoint behaves as expected."),
  makeTable(
    ["Route", "Method", "Who may call it"],
    [
      [[mono("/api/auth/session")], "POST/DELETE", "Anyone with a valid Entra token (POST) to establish a session; DELETE logs out."],
      [[mono("/api/kpi/[id]/xlsx")], "GET", "Any signed-in user (viewer+). Anonymous = 401."],
      [[mono("/api/sharepoint/diagnose")], "GET", "Admin session OR REVALIDATE_SECRET. Else 401."],
      [[mono("/api/revalidate")], "GET/POST", "Caller with REVALIDATE_SECRET (header or query). Else 401/503."],
      [[mono("/api/notifications/evaluate")], "POST", "Caller with Bearer NOTIFICATIONS_CRON_SECRET. Else 401/503."],
      [[mono("/api/health")], "GET", "Public liveness probe (no sensitive data)."],
    ],
    [34, 18, 48],
  ),
  spacer(),
  P([bold("Design note: "), run("interactive users are authorized with RBAC via the session cookie; machine/automation endpoints (scheduler, cache refresh) are authorized with per-purpose shared secrets because a background job cannot perform an interactive login. Both are valid, and both fail closed when their secret is unset.")]),
)

// ---- 8. Security headers ----
children.push(
  H1("8. Step-by-Step: Security Response Headers & CSP"),
  P("Baseline headers are already emitted from next.config.mjs and apply to every response on the deployed app (the preview environment strips framing/CSP so it can render in an iframe — production is unaffected)."),
  H3("8.1 Headers already set"),
  makeTable(
    ["Header", "Value", "Purpose"],
    [
      ["Strict-Transport-Security", "max-age=63072000; includeSubDomains", "Force HTTPS for 2 years."],
      ["X-Content-Type-Options", "nosniff", "Block MIME sniffing."],
      ["X-Frame-Options", "SAMEORIGIN", "Prevent clickjacking / foreign framing."],
      ["Referrer-Policy", "strict-origin-when-cross-origin", "Limit referrer leakage."],
      ["Permissions-Policy", "camera=(), microphone=(), geolocation=()", "Disable unused device APIs."],
      ["Content-Security-Policy-Report-Only", "(starter policy)", "Currently REPORTS violations only."],
    ],
    [34, 34, 32],
  ),
  spacer(),
  H3("8.2 Turn CSP from report-only into enforced"),
  P("The CSP ships in report-only mode so a too-tight rule cannot break the live site on day one. Report-only protects nothing until enforced, so complete this once the app is stable:"),
  Num("Deploy to production and exercise every page (all 21 KPIs, Executive Summary, Reports, Notifications) in a browser with the console open.", "steps5"),
  Num("Note any CSP violation messages. Expect some from Next.js inline hydration scripts and Recharts inline styles — these are already allowed via 'unsafe-inline'.", "steps5"),
  Num([run("In next.config.mjs, rename the header key from "), mono("Content-Security-Policy-Report-Only"), run(" to "), mono("Content-Security-Policy"), run(" to ENFORCE it.")], "steps5"),
  Num("Redeploy and re-test. If a legitimate resource is blocked, add its origin to the matching directive (e.g. connect-src) rather than loosening default-src.", "steps5"),
  P([bold("Hardening target: "), run("the ideal end-state replaces 'unsafe-inline' in script-src with a per-request nonce. This is a larger change; the 'unsafe-inline' allowance is acceptable for internal go-live but should be tracked as a follow-up.")]),
  P([bold("connect-src note: "), run("all SharePoint/Graph calls are made server-side, so the browser only needs connect-src 'self'. If you later add a client-side telemetry or API origin, you MUST add it to connect-src or enforced CSP will block it.")]),
)

// ---- 9. SharePoint / Graph least privilege ----
children.push(
  H1("9. SharePoint / Microsoft Graph Least Privilege"),
  Bullet("Use application permissions scoped as narrowly as possible. Prefer Sites.Selected and grant the app access to ONLY the specific KPI site, rather than tenant-wide Sites.Read.All."),
  Bullet("Store SHAREPOINT_CLIENT_SECRET in Azure Key Vault (or the platform secret store), not in plaintext app settings where feasible. Prefer a certificate credential over a shared secret if your host supports it."),
  Bullet("Set a calendar reminder to rotate the Graph client secret before its expiry; a lapsed secret silently drops the app to local fallback data."),
  Bullet("Confirm the Graph credential is never sent to the browser: it is only read in server-only modules (lib/sharepoint/*), and the /api/kpi/[id]/xlsx route now requires a signed-in user."),
)

// ---- 10. Database & transport ----
children.push(
  H1("10. Database, Transport & Network"),
  H3("10.1 Database"),
  Bullet("Use a dedicated least-privilege database user for DATABASE_URL — it needs DML on the app tables, not superuser."),
  Bullet("Require TLS on the Postgres connection. If using Entra/Azure Postgres, the AZURE_PG_USE_ENTRA / AZURE_PG_SSL_CA settings support managed-identity + CA-pinned TLS; avoid AZURE_PG_SSL_NO_VERIFY in production."),
  Bullet("All database access uses parameterized queries via Drizzle ORM — do not introduce string-concatenated SQL."),
  H3("10.2 Transport / TLS"),
  Bullet("Terminate TLS at the load balancer / reverse proxy with a valid certificate for the production hostname. HSTS is already sent, so HTTPS becomes mandatory for clients after first visit."),
  Bullet("Redirect all HTTP traffic to HTTPS at the proxy layer."),
  H3("10.3 Rate limiting & WAF (recommended follow-ups)"),
  Bullet("Put the app behind a WAF / reverse proxy (Azure Front Door, App Gateway, or Nginx) and rate-limit /api/auth/session and /api/revalidate to blunt brute-force and abuse."),
  Bullet("Restrict machine endpoints (/api/revalidate, /api/notifications/evaluate) to known source IPs where possible, in addition to their shared-secret checks."),
)

// ---- 11. Deployment hardening ----
children.push(
  H1("11. Deployment Hardening"),
  Bullet("The app builds to a self-contained server (output: \"standalone\"). Run it as a non-root service account with only the file permissions it needs."),
  Bullet("If hosting on Azure App Service, do NOT also enable App Service Authentication (Easy Auth) — this app performs its own MSAL + session handling, and two gates would conflict. Pick one; this guide assumes the app's own MSAL."),
  Bullet("Serve over HTTPS only; disable directory listing at the proxy; do not expose the Kudu/SCM console publicly."),
  Bullet("Set NODE_ENV=production. This, combined with an unset REVALIDATE_SECRET check, keeps the diagnose endpoint closed by default in production."),
  Bullet("Keep dependencies patched: run a dependency audit before each release and subscribe to advisories for Next.js and MSAL."),
)

// ---- 12. Verification ----
children.push(
  H1("12. Verification & Acceptance Tests"),
  P("Run these against the PRODUCTION URL after enabling MSAL mode. Replace https://kpi.hiaa.ca with your host. These prove the controls actually work — do not sign off without them."),
  H3("12.1 Unauthenticated access is blocked"),
  Code("curl -i https://kpi.hiaa.ca/api/kpi/kpi-01/xlsx"),
  P("Expected: HTTP 401 with {\"error\":\"Authentication required.\"}. A 200 with file bytes is a FAIL."),
  Code("curl -i https://kpi.hiaa.ca/            # a protected page"),
  P("Expected: a redirect (307/302) to /login."),
  H3("12.2 Machine endpoints reject a missing/wrong secret"),
  Code("curl -i -X POST https://kpi.hiaa.ca/api/revalidate"),
  P("Expected: 401 Unauthorized (or 503 if the secret is not configured)."),
  Code("curl -i -X POST https://kpi.hiaa.ca/api/notifications/evaluate"),
  P("Expected: 401 Unauthorized (or 503 if NOTIFICATIONS_CRON_SECRET is unset)."),
  H3("12.3 Role enforcement (signed in)"),
  Bullet("Sign in as a Viewer: you can see all dashboards and download workbooks, but the \"Run evaluation now\" action is refused (403)."),
  Bullet("Sign in as a Manager: \"Run evaluation now\" succeeds; admin-only assignment/audit actions are refused."),
  Bullet("Sign in as an Administrator: all actions succeed."),
  H3("12.4 Session integrity"),
  Bullet("Inspect the hiaa_session cookie in dev tools: it must be HttpOnly, Secure, SameSite=Lax. It must NOT be readable from document.cookie in the console."),
  Bullet("Tamper with the cookie value by one character and reload — you must be redirected to /login (signature verification rejects it)."),
  H3("12.5 Headers"),
  Code("curl -sI https://kpi.hiaa.ca | grep -iE 'strict-transport|x-frame|x-content|referrer|permissions|content-security'"),
  P("Expected: all baseline headers present; once enforced, Content-Security-Policy (not -Report-Only)."),
)

// ---- 13. Go-live checklist ----
children.push(
  H1("13. Go-Live Sign-Off Checklist"),
  P("Check every box before exposing the application publicly."),
  ...[
    "Entra App Registration created; SPA redirect URIs include the production /login.",
    "\"Expose an API\" scope access_as_user added; App Roles Viewer/Manager/Admin created.",
    "Users assigned to roles; \"Assignment required?\" set to Yes.",
    "NEXT_PUBLIC_AUTH_MODE=msal set and the app redeployed.",
    "AZURE_TENANT_ID and AZURE_CLIENT_ID set server-side (token verification live).",
    "SESSION_SECRET, REVALIDATE_SECRET, NOTIFICATIONS_CRON_SECRET generated (distinct, 32+ bytes) and stored in a vault.",
    "No DEV_IDENTITY_* / NOTIFY_DEV_USER_* variables set in production.",
    "SharePoint/Graph configured with least-privilege (Sites.Selected) and secret in Key Vault.",
    "DATABASE_URL uses a least-privilege user over TLS.",
    "TLS certificate valid for the production hostname; HTTP → HTTPS redirect in place.",
    "CSP moved from report-only to enforced after clean testing.",
    "App Service Easy Auth disabled (app uses its own MSAL).",
    "All section 12 verification tests pass (401/redirect/403/headers/cookie).",
    "Rate limiting / WAF configured for auth and machine endpoints.",
    "Secret rotation reminders scheduled; dependency audit clean.",
  ].map((t) => new Paragraph({ spacing: { after: 70 }, children: [new TextRun({ text: "☐  ", size: 22, bold: true }), new TextRun({ text: t, size: 21 })] })),
)

// ---- 14. Ongoing ----
children.push(
  H1("14. Ongoing Operations"),
  Bullet("Rotate SESSION_SECRET periodically (this invalidates all sessions — users simply re-login). Rotate machine secrets on a schedule and on any suspected exposure."),
  Bullet("Review Entra role assignments quarterly; remove people who have changed roles or left."),
  Bullet("Review the in-app audit log (admin) for privileged actions; investigate anomalies."),
  Bullet("Patch Next.js, MSAL, and other dependencies promptly; re-run the section 12 tests after any auth-related change."),
  Bullet("Re-run /api/sharepoint/diagnose (as admin) after any SharePoint permission or path change to confirm live data is still flowing."),
  spacer(),
  P("End of document.", { italics: true, color: GREY }),
)

// ---- numbering config ----
const numbering = {
  config: ["steps1", "steps2", "steps3", "steps4", "steps5"].map((ref) => ({
    reference: ref,
    levels: [
      { level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START, style: { run: { bold: true, color: NAVY } } },
    ],
  })),
}

const doc = new Document({
  creator: "CNS HIAA IT Security",
  title: "HIAA KPI Dashboard — Security & Go-Live Guide",
  description: "Step-by-step Entra ID + RBAC hardening and go-live procedure.",
  numbering,
  styles: {
    default: { document: { run: { font: "Calibri", size: 21, color: "1F2937" } } },
  },
  sections: [
    {
      properties: { page: { margin: { top: 1100, bottom: 1100, left: 1200, right: 1200 } } },
      children,
    },
  ],
})

const outDir = "public"
mkdirSync(outDir, { recursive: true })
const buffer = await Packer.toBuffer(doc)
const outPath = `${outDir}/HIAA-KPI-Security-Go-Live-Guide.docx`
writeFileSync(outPath, buffer)
console.log(`Wrote ${outPath} (${buffer.length} bytes)`)
