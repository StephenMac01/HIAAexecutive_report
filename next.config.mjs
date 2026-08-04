// @ts-check

/** @type {import("next").NextConfig} */
const nextConfig = {
  /**
   * Produces the minimal Node.js deployment package used by
   * Azure App Service.
   */
  output: "standalone",

  /**
   * These origins are only relevant during development.
   * They do not control production CORS access.
   */
  allowedDevOrigins: ["*.vusercontent.net", "*.vercel.run"],

  /**
   * Azure will serve images directly without requiring the
   * Next.js image-optimization runtime.
   */
  images: {
    unoptimized: true,
  },

  /**
   * Keep PostgreSQL as a native Node.js runtime dependency
   * rather than bundling it into Server Components.
   */
  serverExternalPackages: ["pg"],

  /**
   * Ensure local Excel fallback files are included in the
   * standalone Azure deployment.
   *
   * PostgreSQL packages do not need to be manually listed here.
   * Next.js traces dependencies used by serverExternalPackages.
   */
  outputFileTracingIncludes: {
    "/*": ["./data/**/*.xlsx"],
  },

  /**
   * Removes the default X-Powered-By response header.
   */
  poweredByHeader: false,

  /**
   * Enables HTTP response compression.
   */
  compress: true,

  /**
   * Prevent browser-accessible production source maps.
   */
  productionBrowserSourceMaps: false,

  /**
   * Security headers applied to all routes.
   *
   * CSP remains Report-Only while the application is being tested.
   * This records violations without breaking Next.js scripts,
   * authentication, downloads, or dashboard functionality.
   */
  async headers() {
    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://login.microsoftonline.com",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "upgrade-insecure-requests",
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
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: contentSecurityPolicy,
          },
        ],
      },

      /**
       * API endpoints should not be cached by browsers or proxies.
       */
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
