// Route-level loading UI for /reports.
//
// The reports route renders all 21 KPI dashboards, so its first (cold) compile
// in dev — and its data fetch in production — can take a moment. Without this
// file, Next falls back to the global app/loading.tsx (a bare full-screen
// spinner), which reads as a broken black page. This skeleton mirrors the real
// ReportsView layout (title, toolbar, KPI picker, section cards) so the page
// feels instant and structured while the server work completes.

function Shimmer({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />
}

export default function ReportsLoading() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading KPI reports…</span>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-2">
        <Shimmer className="h-8 w-56" />
        <Shimmer className="h-4 w-full max-w-xl" />
      </div>

      {/* Toolbar */}
      <div className="mb-6 rounded-xl border border-navy/15 bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Shimmer className="h-9 w-28" />
          <div className="flex items-center gap-3">
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-9 w-32" />
            <Shimmer className="h-9 w-24" />
          </div>
        </div>

        {/* KPI picker grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {Array.from({ length: 21 }).map((_, i) => (
            <Shimmer key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>

      {/* Report section cards */}
      <div className="flex flex-col gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <section key={i} className="rounded-xl border border-navy/10 bg-card">
            <div className="flex items-center justify-between gap-2 border-b border-navy/10 px-5 py-3">
              <Shimmer className="h-4 w-48" />
              <Shimmer className="h-4 w-16" />
            </div>
            <div className="space-y-4 p-4">
              <Shimmer className="h-24 w-full" />
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Shimmer className="h-56 w-full" />
                <Shimmer className="h-56 w-full" />
              </div>
              <Shimmer className="h-40 w-full" />
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
