import { Database } from "lucide-react"

export function DbUnavailable() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center rounded-xl border border-navy/15 bg-card px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Database className="size-6" />
      </span>
      <h1 className="mt-4 text-lg font-semibold text-navy">Notifications are temporarily unavailable</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The notification service can&apos;t reach its database right now. Your KPI dashboards are unaffected. Please try
        again shortly.
      </p>
    </div>
  )
}
