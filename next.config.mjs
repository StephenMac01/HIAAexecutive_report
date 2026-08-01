/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",

  allowedDevOrigins: ["*.vusercontent.net", "*.vercel.run"],

  images: {
    unoptimized: true,
  },

  serverExternalPackages: ["pg"],

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
      "./node_modules/postgres-range/**/*",
      "./node_modules/obuf/**/*",
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
      "./node_modules/postgres-range/**/*",
      "./node_modules/obuf/**/*",
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
      "./node_modules/postgres-range/**/*",
      "./node_modules/obuf/**/*",
      "./node_modules/split2/**/*",
    ],
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
