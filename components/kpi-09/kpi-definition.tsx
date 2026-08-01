export function KpiDefinition() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Title row */}
      <div className="grid grid-cols-[140px_1fr]">
        <div className="bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
          KPI-9
        </div>
        <div className="bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground">
          Timeliness
        </div>
      </div>

      {/* Calculation row */}
      <div className="grid grid-cols-[140px_1fr] border-t border-border">
        <div className="flex items-center bg-accent px-4 py-3 text-sm font-medium text-accent-foreground">
          Calculation
        </div>
        <div className="px-4 py-3 text-sm leading-relaxed text-card-foreground">
          A material failure to deliver reports or other documents in accordance with timelines
          expressly required under this Agreement or otherwise agreed in writing by the parties will
          count as one (1) event. HIAA will engage with the Contractor to discuss such timelines and
          schedules prior to administering any Damage Points.
        </div>
      </div>

      {/* Threshold row */}
      <div className="grid grid-cols-[140px_1fr] border-t border-border">
        <div className="flex items-center bg-accent px-4 py-3 text-sm font-medium text-accent-foreground">
          Threshold
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6">
          <Cell label="Fail" filled />
          <Cell label="1" />
          <Cell label="Target" filled />
          <Cell label="0" />
          <Cell label="Success" filled />
          <Cell label="n/a" />
        </div>
      </div>

      {/* Scoring row */}
      <div className="grid grid-cols-[140px_1fr] border-t border-border">
        <div className="flex items-center bg-accent px-4 py-3 text-sm font-medium text-accent-foreground">
          Scoring
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          <Cell label="Damage points" filled />
          <Cell label="10 per event" />
          <Cell label="Advantage points" filled />
          <Cell label="n/a" />
        </div>
      </div>
    </div>
  )
}

function Cell({ label, filled = false }: { label: string; filled?: boolean }) {
  return (
    <div
      className={
        filled
          ? "border-l border-border bg-accent px-3 py-3 text-center text-sm font-medium text-accent-foreground"
          : "border-l border-border px-3 py-3 text-center text-sm text-card-foreground"
      }
    >
      {label}
    </div>
  )
}
