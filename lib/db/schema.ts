import { boolean, index, jsonb, numeric, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"

/**
 * Drizzle schema for the KPI notification system.
 *
 * Column names are snake_case to match the SQL provisioned via the Neon MCP.
 * No foreign-key constraints (per the Neon stack guidance) — relationships are
 * enforced in application code. This shape is intentionally close to a
 * relational Azure SQL model so it can be lifted later.
 */

/** A person who can receive notifications. Keyed by a stable identity id. */
export const appUser = pgTable("app_user", {
  id: text("id").primaryKey(), // identity object id (Entra oid later; dev id now)
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("viewer"), // 'viewer' | 'manager' | 'admin'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

/** A user's subscription to a KPI (or the whole portfolio) + channel prefs. */
export const subscription = pgTable(
  "subscription",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    scope: text("scope").notNull(), // 'kpi' | 'portfolio'
    kpiId: text("kpi_id"), // null when scope = 'portfolio'
    channelDashboard: boolean("channel_dashboard").notNull().default(true),
    channelEmail: boolean("channel_email").notNull().default(false),
    channelTeams: boolean("channel_teams").notNull().default(false),
    minSeverity: text("min_severity").notNull().default("warning"), // 'info'|'warning'|'critical'
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ byUser: index("idx_subscription_user").on(t.userId) }),
)

/** A deduplicated alert produced by the evaluation engine. */
export const alertEvent = pgTable("alert_event", {
  id: text("id").primaryKey(),
  scope: text("scope").notNull(), // 'kpi' | 'portfolio'
  kpiId: text("kpi_id"),
  eventType: text("event_type").notNull(), // 'status_worsened'|'status_recovered'|'band_changed'
  severity: text("severity").notNull(), // 'info'|'warning'|'critical'
  title: text("title").notNull(),
  body: text("body").notNull(),
  statusFrom: text("status_from"),
  statusTo: text("status_to"),
  monthKey: text("month_key").notNull(),
  dedupeKey: text("dedupe_key").notNull().unique(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

/** A per-user, per-channel delivery of an alert event. */
export const delivery = pgTable(
  "delivery",
  {
    id: text("id").primaryKey(),
    alertEventId: text("alert_event_id").notNull(),
    userId: text("user_id").notNull(),
    channel: text("channel").notNull(), // 'dashboard'|'email'|'teams'
    status: text("status").notNull().default("unread"), // 'unread'|'read'|'sent'|'failed'
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ byUserStatus: index("idx_delivery_user_status").on(t.userId, t.status, t.createdAt) }),
)

/** Immutable audit trail of user + system actions. */
export const auditLog = pgTable("audit_log", {
  id: text("id").primaryKey(),
  actorUserId: text("actor_user_id"), // null for system actions
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

/** Last-known status per KPI/portfolio, used to detect transitions. */
export const kpiStatusSnapshot = pgTable(
  "kpi_status_snapshot",
  {
    id: text("id").primaryKey(),
    scope: text("scope").notNull(),
    kpiId: text("kpi_id"),
    monthKey: text("month_key").notNull(),
    status: text("status").notNull(),
    band: text("band"),
    damage: numeric("damage"),
    snapshot: jsonb("snapshot"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ byScopeKpi: uniqueIndex("idx_snapshot_scope_kpi").on(t.scope, t.kpiId) }),
)

export type AppUser = typeof appUser.$inferSelect
export type Subscription = typeof subscription.$inferSelect
export type AlertEvent = typeof alertEvent.$inferSelect
export type Delivery = typeof delivery.$inferSelect
export type AuditLog = typeof auditLog.$inferSelect
export type KpiStatusSnapshot = typeof kpiStatusSnapshot.$inferSelect
