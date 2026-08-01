/** @type {import("next").NextConfig} */
const nextConfig = {
  // Emit a self-contained Node.js server under .next/standalone.
  output: "standalone",

  // Allow v0 preview hosts to load Next.js development resources.
  allowedDevOrigins: ["*.vusercontent.net", "*.vercel.run"],

  images: {
    unoptimized: true,
  },

  // Keep PostgreSQL packages external and load them through Node.js.
  serverExternalPackages: ["pg", "pg-types"],

  // Include Excel workbooks and PostgreSQL runtime dependencies
  // in the standalone deployment output.
  outputFileTracingIncludes: {
    "/kpi/[id]": [
      "./data/**/*.xlsx",
      "./node_modules/pg/**/*",
      "./node_modules/pg-types/**/*",
      "./node_modules/pg-pool/**/*",
      "./node_modules/pg-protocol/**/*",
      "./node_modules/pg-connection-string/**/*",
      "./node_modules/pgpass/**/*",
      "./node_modules/pg-int8/**/*",
      "./node_modules/postgres-array/**/*",
      "./node_modules/postgres-bytea/**/*",
      "./node_modules/postgres-date/**/*",
      "./node_modules/postgres-interval/**/*",
      "./node_modules/split2/**/*",
    ],

    "/reports": [
      "./data/**/*.xlsx",
      "./node_modules/pg/**/*",
      "./node_modules/pg-types/**/*",
      "./node_modules/pg-pool/**/*",
      "./node_modules/pg-protocol/**/*",
      "./node_modules/pg-connection-string/**/*",
      "./node_modules/pgpass/**/*",
      "./node_modules/pg-int8/**/*",
      "./node_modules/postgres-array/**/*",
      "./node_modules/postgres-bytea/**/*",
      "./node_modules/postgres-date/**/*",
      "./node_modules/postgres-interval/**/*",
      "./node_modules/split2/**/*",
    ],

    "/*": [
      "./node_modules/pg/**/*",
      "./node_modules/pg-types/**/*",
      "./node_modules/pg-pool/**/*",
      "./node_modules/pg-protocol/**/*",
      "./node_modules/pg-connection-string/**/*",
      "./node_modules/pgpass/**/*",
      "./node_modules/pg-int8/**/*",
      "./node_modules/postgres-array/**/*",
      "./node_modules/postgres-bytea/**/*",
      "./node_modules/postgres-date/**/*",
      "./node_modules/postgres-interval/**/*",
      "./node_modules/split2/**/*",
    ],
  },

  // Baseline security headers.
  async headers() {
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
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: csp,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
