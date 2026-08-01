// Architecture guard for the CNS HIAA KPI Dashboard.
//
// Fails (exit 1) when the standardized data-loading contract is violated:
//   Dashboard → get-data.ts → get-rows.ts → workbook-source.ts → SharePoint
//
// Run with:  node scripts/validate-architecture.mjs   (or: pnpm validate)
//
// Checks, per KPI (kpi-01 … kpi-21):
//   1. lib/kpi-NN/get-data.ts exists.
//   2. get-data.ts routes through "@/lib/kpi-data/get-rows" (the bridge).
//   3. get-data.ts does NOT read files or reach SharePoint directly
//      (no node:fs / node:path / graph-client / workbook-source / XLSX.read).
//   4. A local fallback workbook exists at data/kpi-NN/kpi-NN.xlsx.
// Repo-wide:
//   5. Nothing imports the retired loader filenames as data loaders.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

const ROOT = process.cwd()
const KPI_IDS = Array.from({ length: 21 }, (_, i) => `kpi-${String(i + 1).padStart(2, "0")}`)

const errors = []
const warnings = []

function read(path) {
  try {
    return readFileSync(path, "utf8")
  } catch {
    return null
  }
}

// --- Per-KPI checks --------------------------------------------------------
for (const id of KPI_IDS) {
  const dir = join(ROOT, "lib", id)
  const getData = join(dir, "get-data.ts")

  if (!existsSync(getData)) {
    errors.push(`${id}: missing lib/${id}/get-data.ts (required entry point)`)
    continue
  }

  const src = read(getData) ?? ""

  // 2. Must route through the shared bridge.
  if (!src.includes("@/lib/kpi-data/get-rows")) {
    errors.push(`${id}: get-data.ts does not import "@/lib/kpi-data/get-rows" (bypasses the bridge)`)
  }

  // 3. Must not perform direct I/O or reach SharePoint/Graph directly.
  const forbidden = [
    ['node:fs', /from ["']node:fs["']|require\(["']fs["']\)/],
    ['node:path', /from ["']node:path["']/],
    ['graph-client', /@\/lib\/sharepoint\/graph-client/],
    ['workbook-source', /@\/lib\/sharepoint\/workbook-source/],
    ['XLSX.read', /XLSX\.read\b/],
    ['readFileSync', /readFileSync\b/],
  ]
  for (const [label, re] of forbidden) {
    if (re.test(src)) {
      errors.push(`${id}: get-data.ts references "${label}" directly (must go through get-rows.ts)`)
    }
  }

  // 4. Local fallback workbook mapping must exist.
  const fallback = join(ROOT, "data", id, `${id}.xlsx`)
  if (!existsSync(fallback)) {
    errors.push(`${id}: missing local fallback workbook data/${id}/${id}.xlsx`)
  }
}

// --- Repo-wide: no retired loader filenames used as loaders ----------------
const RETIRED = ["kpi-loader", "kpi-source"]
function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name.startsWith(".")) continue
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) walk(full)
    else if (/\.(ts|tsx)$/.test(name)) {
      const src = read(full) ?? ""
      for (const retired of RETIRED) {
        if (new RegExp(`@/lib/kpi-\\d{2}/${retired}\\b`).test(src)) {
          errors.push(`${full.replace(ROOT + "/", "")}: imports retired loader "${retired}" (use get-data.ts)`)
        }
      }
    }
  }
}
walk(join(ROOT, "lib"))
walk(join(ROOT, "components"))
walk(join(ROOT, "app"))

// --- Report ----------------------------------------------------------------
if (warnings.length) {
  console.log("\nArchitecture warnings:")
  for (const w of warnings) console.log(`  ! ${w}`)
}

if (errors.length) {
  console.error("\nArchitecture validation FAILED:")
  for (const e of errors) console.error(`  x ${e}`)
  console.error(`\n${errors.length} violation(s). The standardized KPI data flow must be preserved.\n`)
  process.exit(1)
}

console.log(`\nArchitecture OK — all ${KPI_IDS.length} KPIs route Dashboard → get-data → get-rows → workbook-source → SharePoint.\n`)
