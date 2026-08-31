import type { Metadata } from "next"
import Link from "next/link"
import {
  BookOpen,
  Bell,
  Cloud,
  Database,
  Download,
  FileText,
  LayoutGrid,
  Palette,
  Settings,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Help & Manuals | CNS HIAA",
  description:
    "Download the CNS HIAA Airport KPI Dashboard user guide, IT / technical guide, and design & Azure deployment guide. Works on PC, Mac, iPhone, and Android.",
}

type Manual = {
  title: string
  audience: string
  href: string
  fileLabel: string
  icon: typeof BookOpen
  accent: "aviation" | "navy"
  summary: string
  contents: { icon: typeof BookOpen; text: string }[]
}

const MANUALS: Manual[] = [
  {
    title: "User Guide",
    audience: "For all dashboard users",
    href: "/manuals/CNS-HIAA-KPI-Dashboard-User-Guide.docx",
    fileLabel: "Word document (.docx)",
    icon: Users,
    accent: "aviation",
    summary:
      "A non-technical walkthrough of the dashboard: signing in, reading the Executive Summary and KPI pages, following the KPIs you care about, and managing your notifications — on any device.",
    contents: [
      { icon: LayoutGrid, text: "Getting around the four areas" },
      { icon: FileText, text: "Reading the KPI dashboards & charts" },
      { icon: Bell, text: "Notifications, subscriptions & alerts" },
      { icon: Smartphone, text: "Using it on a phone or tablet" },
    ],
  },
  {
    title: "IT & Technical Guide",
    audience: "For IT administrators and developers",
    href: "/manuals/CNS-HIAA-KPI-Dashboard-IT-Technical-Guide.docx",
    fileLabel: "Word document (.docx)",
    icon: Settings,
    accent: "navy",
    summary:
      "Architecture and operations reference: how the source spreadsheets drive KPI-01 through KPI-21, environment configuration, the notification engine and database, enabling email/Teams, cross-platform delivery, and security.",
    contents: [
      { icon: FileText, text: "Data pipeline: spreadsheets → KPIs" },
      { icon: Settings, text: "Environment variables & configuration" },
      { icon: Bell, text: "Notification engine & database" },
      { icon: Smartphone, text: "Cross-platform delivery & security" },
    ],
  },
  {
    title: "Design & Azure Deployment Guide",
    audience: "For architects and Azure administrators",
    href: "/manuals/CNS-HIAA-KPI-Dashboard-Design-and-Azure-Deployment-Guide.docx",
    fileLabel: "Word document (.docx)",
    icon: Cloud,
    accent: "aviation",
    summary:
      "The system architecture and visual design system, plus a step-by-step guide to deploying on Microsoft Azure — Azure Database for PostgreSQL Flexible Server, Microsoft Entra ID sign-in, role-based access control, and scheduled evaluation with Power Automate.",
    contents: [
      { icon: Palette, text: "Architecture & visual design system" },
      { icon: Database, text: "Azure PostgreSQL Flexible Server setup" },
      { icon: ShieldCheck, text: "Entra ID sign-in & RBAC roles" },
      { icon: Cloud, text: "Power Automate scheduled evaluation" },
    ],
  },
]

export default function HelpPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-border pb-6">
        <div className="flex items-center gap-2 text-sm font-medium text-aviation">
          <BookOpen className="size-4" />
          Documentation
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-navy text-balance">Help &amp; Manuals</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty">
          Download the guides for the CNS HIAA Airport KPI Dashboard. The dashboard runs in any modern browser on
          Windows PC, Mac, iPhone, iPad, and Android — there is nothing to install.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MANUALS.map((m) => (
          <ManualCard key={m.href} manual={m} />
        ))}
      </div>

      <section className="mt-8 rounded-xl border border-navy/15 bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-navy">Which guide do I need?</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium text-navy">Choose the User Guide if…</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              you view KPIs, follow status changes, and manage your own notification preferences.
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium text-navy">Choose the IT &amp; Technical Guide if…</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              you configure SharePoint data, environment variables, delivery channels, or operate the deployment.
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium text-navy">Choose the Design &amp; Azure Deployment Guide if…</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              you are standing up the app on Azure — PostgreSQL Flexible Server, Entra ID sign-in, RBAC, and Power
              Automate scheduling.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

function ManualCard({ manual }: { manual: Manual }) {
  const Icon = manual.icon
  const isAviation = manual.accent === "aviation"
  return (
    <article className="flex flex-col rounded-xl border border-navy/15 bg-card p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span
          className={
            isAviation
              ? "flex size-11 shrink-0 items-center justify-center rounded-lg bg-aviation/10 text-aviation"
              : "flex size-11 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-navy"
          }
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-navy">{manual.title}</h2>
          <p className="text-sm font-medium text-muted-foreground">{manual.audience}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground text-pretty">{manual.summary}</p>

      <ul className="mt-4 flex flex-col gap-2">
        {manual.contents.map((item, i) => {
          const ItemIcon = item.icon
          return (
            <li key={i} className="flex items-center gap-2 text-sm text-navy">
              <ItemIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              {item.text}
            </li>
          )
        })}
      </ul>

      <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-medium text-muted-foreground">{manual.fileLabel}</span>
        <Link
          href={manual.href}
          download
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-navy-foreground transition-colors hover:bg-navy/90"
        >
          <Download className="size-4" />
          Download
        </Link>
      </div>
    </article>
  )
}
