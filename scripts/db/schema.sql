-- CNS HIAA KPI Dashboard — notification schema
-- Target: Azure Database for PostgreSQL Flexible Server (standard PostgreSQL 14+).
--
-- Provision the tables on a fresh Azure server with psql:
--   psql "host=<server>.postgres.database.azure.com port=5432 dbname=kpi \
--         user=dbadmin sslmode=require" -f scripts/db/schema.sql
--
-- Idempotent: safe to re-run. Relationships are enforced in application code
-- (no foreign-key constraints), matching lib/db/schema.ts.

CREATE TABLE IF NOT EXISTS app_user (
  id            text PRIMARY KEY,
  email         text NOT NULL,
  display_name  text NOT NULL,
  role          text NOT NULL DEFAULT 'viewer',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscription (
  id                 text PRIMARY KEY,
  user_id            text NOT NULL,
  scope              text NOT NULL,
  kpi_id             text,
  channel_dashboard  boolean NOT NULL DEFAULT true,
  channel_email      boolean NOT NULL DEFAULT false,
  channel_teams      boolean NOT NULL DEFAULT false,
  min_severity       text NOT NULL DEFAULT 'warning',
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subscription_user ON subscription (user_id);

CREATE TABLE IF NOT EXISTS alert_event (
  id           text PRIMARY KEY,
  scope        text NOT NULL,
  kpi_id       text,
  event_type   text NOT NULL,
  severity     text NOT NULL,
  title        text NOT NULL,
  body         text NOT NULL,
  status_from  text,
  status_to    text,
  month_key    text NOT NULL,
  dedupe_key   text NOT NULL UNIQUE,
  payload      jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS delivery (
  id              text PRIMARY KEY,
  alert_event_id  text NOT NULL,
  user_id         text NOT NULL,
  channel         text NOT NULL,
  status          text NOT NULL DEFAULT 'unread',
  read_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_delivery_user_status
  ON delivery (user_id, status, created_at);

CREATE TABLE IF NOT EXISTS audit_log (
  id             text PRIMARY KEY,
  actor_user_id  text,
  action         text NOT NULL,
  entity_type    text NOT NULL,
  entity_id      text,
  metadata       jsonb,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kpi_status_snapshot (
  id          text PRIMARY KEY,
  scope       text NOT NULL,
  kpi_id      text,
  month_key   text NOT NULL,
  status      text NOT NULL,
  band        text,
  damage      numeric,
  snapshot    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
-- Matches lib/db/schema.ts. The app's writeSnapshot reads-then-updates by id,
-- so it does not rely on ON CONFLICT here (portfolio rows use kpi_id IS NULL).
CREATE UNIQUE INDEX IF NOT EXISTS idx_snapshot_scope_kpi
  ON kpi_status_snapshot (scope, kpi_id);
