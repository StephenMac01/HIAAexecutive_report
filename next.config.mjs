/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained Node.js server under `.next/standalone` so the app
  // can be hosted internally (bare Node server, Windows service, or Docker)
  // with no Vercel or other PaaS dependency. Run it with:
  //   node .next/standalone/server.js
  // (copy `.next/static` and `public` alongside it, per the Next.js docs).
  output: "standalone",
  images: {
    unoptimized: true,
  },
  // Bundle the per-KPI Excel workbooks into the traced output so the
  // server-side file loaders keep working when self-hosted — even if a KPI
  // route ever switches from static prerender to dynamic rendering.
  outputFileTracingIncludes: {
    "/kpi/[id]": ["./data/**/*.xlsx"],
    "/reports": ["./data/**/*.xlsx"],
  },
}

export default nextConfig
