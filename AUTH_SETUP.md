# Auth & Data-Residency Setup (Entra ID + Azure PostgreSQL, Canada East)

This app uses **browser-based Microsoft Entra ID (MSAL) authentication** with a
server-validated session cookie, and **Azure Database for PostgreSQL Flexible
Server**. All data stays in Canada by provisioning every resource in a Canadian
region (`canadaeast` / `canadacentral`). The application code is region-agnostic
— residency is determined entirely by **where you provision**.

> App Service "Easy Auth" is intentionally **off**. Login happens in the browser
> via MSAL (`loginRedirect`), the token is posted to `POST /api/auth/session`,
> the server validates it against Entra JWKS, and mints a signed httpOnly
> session cookie. See `lib/auth/*` and `app/(pages)/login/*`.

---

## 0. Prerequisites

```bash
az login
az account set --subscription "<your-subscription-id>"
az extension add --name rdbms-connect --upgrade   # for 'az postgres flexible-server connect'
```

---

## 1. Azure Database for PostgreSQL — Canada East

```bash
# --- Variables -------------------------------------------------------------
RG="rg-cns-hiaa-cae"
LOC="canadaeast"
PG="cns-hiaa-pg-cae"                 # must be globally unique
ADMIN="cnsadmin"
PGADMINPW='<STRONG-PASSWORD>'
DB="kpi"

# --- Resource group --------------------------------------------------------
az group create --name "$RG" --location "$LOC"

# --- Flexible Server pinned to Canada East (TLS enforced by default) -------
az postgres flexible-server create \
  --resource-group "$RG" \
  --name "$PG" \
  --location "$LOC" \
  --tier Burstable --sku-name Standard_B1ms \
  --version 16 \
  --storage-size 32 \
  --admin-user "$ADMIN" \
  --admin-password "$PGADMINPW" \
  --public-access None \
  --high-availability Disabled

# --- Application database ---------------------------------------------------
az postgres flexible-server db create \
  --resource-group "$RG" --server-name "$PG" --database-name "$DB"

# --- (Recommended) Entra-only auth, no SQL password ------------------------
az postgres flexible-server update \
  --resource-group "$RG" --name "$PG" \
  --active-directory-auth Enabled --password-auth Disabled
```

**Connection string** (`DATABASE_URL`):

```
postgresql://<user>:<pw>@cns-hiaa-pg-cae.postgres.database.azure.com:5432/kpi?sslmode=require
```

- `sslmode=require` (or stricter `verify-full`) is mandatory — the code enforces TLS.
- With Entra-only auth, the "password" is a short-lived Entra access token
  requested at runtime by the app's managed identity (already supported in
  `lib/db/index.ts`); you do not store a static password.

---

## 2. Entra ID app registration (SPA + API + App Roles)

```bash
TENANT_ID="<your-tenant-guid>"
APP_ID="<your-app-client-id>"        # the app registration (client) id
PROD_HOST="<your-prod-host>"         # e.g. cns-hiaa.example.ca
```

### 2a. SPA redirect URIs

In **Entra portal → App registrations → your app → Authentication →
Add a platform → Single-page application**, add:

- `https://<PROD_HOST>/login`
- `http://localhost:3000/login` (local dev)

Enable **ID tokens** and **Access tokens** for the SPA platform.

### 2b. Expose an API scope (`access_as_user`)

```bash
az ad app update --id "$APP_ID" --identifier-uris "api://$APP_ID"
```

Then **Expose an API → Add a scope**: scope name `access_as_user`, admin +
users can consent. The app requests `api://<APP_ID>/access_as_user`.

### 2c. App Roles manifest

**App registration → App roles → Create app role** for each below, or paste this
into the manifest's `appRoles` array:

```json
[
  {
    "allowedMemberTypes": ["User"],
    "description": "Full administrative access to the dashboard and settings.",
    "displayName": "Admin",
    "isEnabled": true,
    "value": "Admin"
  },
  {
    "allowedMemberTypes": ["User"],
    "description": "Can manage KPI reporting and trigger evaluations.",
    "displayName": "Manager",
    "isEnabled": true,
    "value": "Manager"
  },
  {
    "allowedMemberTypes": ["User"],
    "description": "Read-only access to dashboards and reports.",
    "displayName": "Viewer",
    "isEnabled": true,
    "value": "Viewer"
  }
]
```

> Role mapping (see `lib/auth/roles.ts`): any role containing `admin` → `admin`,
> `manager` → `manager`, otherwise `viewer`.

### 2d. Assign users to roles

**Entra portal → Enterprise applications → your app → Users and groups →
Add user/group**, pick the user, and choose a role (Admin / Manager / Viewer).

---

## 3. Turn OFF App Service Easy Auth

```bash
az webapp auth update --resource-group "$RG" \
  --name "<your-app-service>" --enabled false
```

---

## 4. App settings (MSAL mode)

```bash
az webapp config appsettings set \
  --resource-group "$RG" --name "<your-app-service>" --settings \
    NEXT_PUBLIC_AUTH_MODE=msal \
    NEXT_PUBLIC_AZURE_CLIENT_ID="$APP_ID" \
    NEXT_PUBLIC_AZURE_TENANT_ID="$TENANT_ID" \
    AZURE_CLIENT_ID="$APP_ID" \
    AZURE_TENANT_ID="$TENANT_ID" \
    SESSION_SECRET="$(openssl rand -base64 32)" \
    DATABASE_URL="postgresql://<user>:<pw>@$PG.postgres.database.azure.com:5432/$DB?sslmode=require"
```

Optional overrides (only if your values differ from the defaults):

```bash
#   NEXT_PUBLIC_AZURE_REDIRECT_URI=https://<PROD_HOST>/login
#   NEXT_PUBLIC_AZURE_POST_LOGOUT_URI=https://<PROD_HOST>/login?loggedOut=true
#   NEXT_PUBLIC_AZURE_API_SCOPE=api://<APP_ID>/access_as_user
#   AZURE_API_AUDIENCE=api://<APP_ID>
```

---

## 5. Data-residency checklist (no data outside Canada)

- [ ] PostgreSQL Flexible Server in `canadaeast` (or `canadacentral`).
- [ ] App Service / hosting plan in a Canadian region.
- [ ] Any Blob/File storage accounts in a Canadian region.
- [ ] Backups: geo-redundancy either disabled or paired within Canada
      (`canadacentral` ↔ `canadaeast`), never a non-Canadian pair.
- [ ] Entra tenant data-residency region is Canada
      (directory data location is set at tenant creation).
- [ ] No third-party analytics/logging that egresses data outside Canada.
- [ ] `DATABASE_URL` is the only user-data store; it points at the Canadian
      server above.

---

## 6. Local development

No Azure needed. Leave `NEXT_PUBLIC_AUTH_MODE` unset (or `dev`) and the app uses
a configurable dev identity (see `.env.example`). The `/login` page shows a
"Microsoft sign-in is disabled" notice with a **Continue to dashboard** link.
The v0 preview always runs in this dev mode because it has no Entra tenant.
