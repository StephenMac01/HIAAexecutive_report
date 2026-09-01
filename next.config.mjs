/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  allowedDevOrigins: ["*.vusercontent.net", "*.vercel.run"],

  images: {
    unoptimized: true,
  },

  /**
   * Keep node-postgres external to the server bundle.
   *
   * This avoids Turbopack creating a partially bundled/externalized
   * pg package with missing transitive runtime dependencies.
   */
  serverExternalPackages: [
    "pg",
    "pg-types",
    "pg-protocol",
    "pg-pool",
    "pg-connection-string",
    "pgpass",
    "postgres-array",
    "postgres-bytea",
    "postgres-date",
    "postgres-interval",
    "obuf",
  ],

  /**
   * Only explicitly trace non-package data files here.
   *
   * Let Next/Node handle installed npm packages rather than forcing
   * individual pg dependency folders into the trace.
   */
  outputFileTracingIncludes: {
    "/kpi/[id]": ["./data/**/*.xlsx"],

    "/reports": ["./data/**/*.xlsx"],
  },

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
