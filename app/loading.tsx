import Image from "next/image"

/**
 * App-wide route loading screen, also used as the fallback while Microsoft
 * Entra ID interaction is in progress on the sign-in flow. Branded and
 * intentionally minimal so it reads as "secure, in-progress" rather than a
 * blank flash.
 */
export default function Loading() {
  return (
    <main
      className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-5">
        <span className="relative flex size-16 items-center justify-center overflow-hidden rounded-2xl bg-navy shadow-sm">
          <Image
            src="/cns-hiaa-logo.png"
            alt="CNS HIAA logo"
            width={52}
            height={52}
            className="object-contain"
            priority
          />
        </span>

        <div className="flex flex-col items-center gap-3">
          <span className="size-6 animate-spin rounded-full border-2 border-navy/20 border-t-navy" aria-hidden="true" />
          <p className="text-sm font-medium text-navy">Loading your dashboard…</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Secured by Microsoft Entra ID</p>
      <span className="sr-only">Please wait while the page loads.</span>
    </main>
  )
}
