"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CurrentUser } from "@/lib/notifications/types"

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  manager: "Manager",
  viewer: "Viewer",
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: "Full access, including subscription assignment and audit review.",
  manager: "Can manage own subscriptions and acknowledge alerts for assigned KPIs.",
  viewer: "Can view dashboards and manage own alert subscriptions.",
}

export function ProfilePanel({ user }: { user: CurrentUser }) {
  const initials = user.displayName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-xl font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-foreground">{user.displayName}</h2>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            <Badge variant="secondary" className="mt-1">
              {ROLE_LABELS[user.role] ?? user.role}
            </Badge>
          </div>
        </div>

        <dl className="mt-6 divide-y divide-border border-t border-border text-sm">
          <div className="flex justify-between py-3">
            <dt className="text-muted-foreground">Role</dt>
            <dd className="font-medium text-foreground">{ROLE_LABELS[user.role] ?? user.role}</dd>
          </div>
          <div className="py-3">
            <dt className="text-muted-foreground">Permissions</dt>
            <dd className="mt-1 text-foreground">{ROLE_DESCRIPTIONS[user.role] ?? "Standard access."}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-muted-foreground">Directory ID</dt>
            <dd className="font-mono text-xs text-foreground">{user.id}</dd>
          </div>
        </dl>

        <p className="mt-4 rounded-md bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
          Identity is currently resolved through a pluggable provider. When Microsoft Entra ID sign-in is enabled, this
          profile will populate automatically from your directory account and role assignment.
        </p>
      </Card>
    </div>
  )
}
