import { FileSpreadsheet, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DataSourceNote({ totalRows }: { totalRows: number }) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[var(--chart-5)]/12 text-[var(--chart-5)]">
            <FileSpreadsheet className="size-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle>Powered by an Excel sheet</CardTitle>
            <p className="text-sm text-muted-foreground">
              Every chart above is derived from{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                data/kpi-04-events.xlsx
              </code>{" "}
              — currently {totalRows} event rows.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-3">
          <Plus className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden="true" />
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">To add data each week:</span> open
            the <span className="font-medium text-foreground">Events</span> sheet and append
            one row per event. Keep the header row exactly as-is.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Column</th>
                <th className="py-2 pr-4 font-medium">Example</th>
                <th className="py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {COLUMNS.map((c) => (
                <tr key={c.name} className="border-b border-border/60">
                  <td className="whitespace-nowrap py-1.5 pr-4 text-foreground">{c.name}</td>
                  <td className="whitespace-nowrap py-1.5 pr-4 text-muted-foreground">
                    {c.example}
                  </td>
                  <td className="py-1.5 font-sans text-muted-foreground">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

const COLUMNS = [
  { name: "Event ID", example: "EV-042", note: "Unique reference for the event" },
  { name: "Shift Date", example: "2026-07-14", note: "Date of the affected shift (YYYY-MM-DD)" },
  { name: "Shift Time", example: "23:00", note: "Start time, 24-hour" },
  { name: "Terminal/Zone", example: "Terminal 1", note: "Area of the airport" },
  { name: "Post", example: "Screening Lane C", note: "Specific post / location" },
  { name: "Event Type", example: "Late Report", note: '"Late Report" or "No Advance Notice"' },
  { name: "Missing Staff", example: "1", note: "Number of unfilled positions" },
  { name: "Report Minutes", example: "12", note: "Late Report only — minutes to notify HIAA (SLA 5)" },
  { name: "Notice Hours", example: "6", note: "No Advance Notice only — hours of notice (need 24)" },
  { name: "Reported To HIAA", example: "Yes", note: '"Yes" or "No"' },
  { name: "Damage Points", example: "10", note: "10 per event" },
  { name: "Reporting Week", example: "2026-W29", note: "ISO week the event is logged" },
  { name: "Notes", example: "No-show confirmed…", note: "Free text detail" },
]
