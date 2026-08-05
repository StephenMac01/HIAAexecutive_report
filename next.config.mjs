/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained Node.js server under `.next/standalone` so the app
  // can be hosted internally (bare Node server, Windows service, or Docker)
  // with no Vercel or other PaaS dependency. Run it with:
  //   node .next/standalone/server.js
  // (copy `.next/static` and `public` alongside it, per the Next.js docs).
  output: "standalone",
  // Allow the v0 preview hosts to load Next.js dev resources (HMR client,
  // fonts, JS chunks). Without this, Next.js 16 blocks these cross-origin dev
  // requests and the app never hydrates inside the preview iframe. These only
  // affect local/dev serving; they have no effect on the deployed app.
  allowedDevOrigins: ["*.vusercontent.net", "*.vercel.run"],
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
  // Baseline security headers (defense-in-depth). These apply on the deployed
  // app; the v0 preview strips framing/CSP so the app still renders in-frame.
  async headers() {
    // Report-only CSP: logs violations without breaking the live site. Tighten
    // and switch to "Content-Security-Policy" once reports are clean. Next.js
    // emits inline hydration scripts and Recharts uses inline styles, hence the
    // 'unsafe-inline' allowances here. All SharePoint/Graph calls are made
    // server-side, so no external connect-src origins are required.
    const csp = [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "connect-src 'self'",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'self'",
    ].join("; ")

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy-Report-Only", value: csp },
        ],
      },
    ]
  },
}

export default nextConfig
