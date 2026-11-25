# Architecture

All Choirs' Conference 2027 is a Next.js application for conference registration, ticketing, Paystack payments, public statistics, and an authenticated admin dashboard.

## System overview

| Concern | Implementation |
| --- | --- |
| Framework | Next.js 15 App Router (React 19, Server Components, Server Actions) |
| Language | TypeScript (strict) |
| Database | PostgreSQL |
| ORM | Drizzle ORM + drizzle-kit migrations (`node-postgres` driver) |
| Auth | Supabase Auth (cookie sessions via `@supabase/ssr`) |
| UI | Tailwind CSS + shadcn/ui ("base-nova" style on `@base-ui/react`) |
| Payments | Paystack REST API (plain `fetch`, no SDK) |

There is no separate backend service. Server Components read through feature services; mutations run through Server Actions; a small set of route handlers covers webhooks and machine-readable public endpoints.

### Route layout

| Route | Type | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/register` | Public | Registration form |
| `/registration/[code]` | Public | Registration confirmation lookup |
| `/statistics` | Public | Aggregate registration statistics |
| `/ticket/[token]` | Public | Ticket display and QR download |
| `/admin/login` | Admin | Sign-in page |
| `/admin`, `/admin/{registrations,assemblies,families,speakers,settings,payments,tickets}` | Admin | Protected dashboard |
| `/api/registration/lookup` | API | Registrant lookup by email/phone (rate-limited) |
| `/api/payments/paystack/webhook` | API | Paystack webhook receiver |
| `/api/tickets/verify/[token]` | API | Opaque ticket verification endpoint |

All app code lives under `src/` with the `@/*` path alias mapping to `src/*`.

## Feature-module convention

Business logic is sliced by domain under `src/features/`:

```
src/features/<domain>/
  schema.ts       Drizzle tables, enums, relations
  service.ts      Database queries and business rules (no auth logic)
  actions.ts      "use server" entry points (Zod validation + authorization)
  validation.ts   Shared Zod schemas (where applicable)
  components/     Feature-scoped client components (where applicable)
  types.ts        Shared TypeScript types (where applicable)
```

Domains: `registration`, `payment`, `ticket`, `family`, `assembly`, `conference`, `institution`, `speaker`, `dashboard`, `email`, `audit`, plus shared utilities in `src/features/shared/`.

Cross-cutting directories:

- `src/app/` — routing, layouts, pages, API route handlers
- `src/db/` — connection, schema barrel, seed data
- `src/lib/` — Supabase clients and generic utilities
- `src/components/` — shared UI primitives and public site chrome

Services own data access. Pages and Server Actions call services; components never query the database directly. UI that needs interactivity is marked `"use client"`; pages and data-loading layouts stay server-side.

## Database

### Schema location

- **Entry point:** `src/db/schema.ts` — a barrel that re-exports every feature schema.
- **Table definitions:** `src/features/*/schema.ts` — one file per domain.
- **Drizzle config:** `drizzle.config.ts` (`schema: "./src/db/schema.ts"`, `out: "./drizzle"`).
- **Migrations:** `drizzle/*.sql` with snapshots in `drizzle/meta/`.
- **Connection:** `src/db/index.ts` — `getDb()` builds a Drizzle client from `DATABASE_URL`.
- **Seed:** `src/db/seed.ts` → `seedDefaults()` in `src/db/service.ts`.

An empty `prisma/` directory remains from an earlier setup; Drizzle is the only ORM in use.

### Tables

| Domain | Tables |
| --- | --- |
| Registration | `registrations`, `registration_categories`, `position_options`, `registration_positions`, `historical_registrants` |
| Assembly / family | `assemblies`, `conference_families`, `conference_family_assemblies` |
| Conference | `conference` |
| Institution | `institutions`, `academic_levels` |
| Payment | `payments`, `payment_webhook_events` |
| Ticket | `tickets`, `ticket_types` |
| Content | `speakers` |
| Ops | `email_logs`, `audit_logs` |

Enums: `vocal_part`, `registration_status` (`PENDING_PAYMENT`, `CONFIRMED`, `CANCELLED`, `EXPIRED`), `payment_status`, `ticket_status`, `institution_type`.

Key relationships:

- `registrations` → `assemblies`, `registration_categories`, `academic_levels`
- `registration_positions` — join table between registrations and position options
- `conference_family_assemblies` — assigns an assembly to a family for a conference; registration options and ticket family labels derive from it
- `payments` → `registrations` (unique `reference`); `payment_webhook_events` unique on `(provider, event_id)`
- `tickets` → `registrations` (one ticket per registration, unique `token`)

### Migration workflow

```bash
npm run db:generate   # generate SQL from schema changes
npm run db:migrate    # apply migrations
npm run db:seed       # load conference defaults, categories, families, prices, levels
```

## Authentication flow

Authentication is **admin-only**. Public registration, statistics, and ticket pages require no session. There is no sign-up flow: administrators are created or invited directly in Supabase, and access is gated by an env-var email allowlist.

### Components

- `src/middleware.ts` — session refresh and route protection for `/admin` and `/admin/:path*`
- `src/lib/supabase/server.ts` — server client (`createSupabaseServerClient`) and `getAdminUser()`
- `src/lib/supabase/client.ts` — browser client used by the login form
- `src/lib/supabase/admin.ts` — `ADMIN_EMAILS` parsing and `isAdminEmail()`
- `src/app/admin/login/` — login page and client sign-in form
- `src/app/admin/actions.ts` — sign-out Server Action

### Request flow

1. **Middleware runs on every `/admin` request.** It creates an `@supabase/ssr` client bound to request/response cookies and calls `supabase.auth.getUser()`, which validates the session and refreshes cookies when needed.
2. **Fail-closed configuration checks.** If Supabase env vars are missing or `ADMIN_EMAILS` is empty, requests are redirected to `/admin/login?error=...` instead of being allowed through.
3. **Authorization checks.** No user → `sign_in_required`; email not in `ADMIN_EMAILS` → `not_authorized`. On the login page itself, an authenticated admin is redirected to `/admin`; a signed-in non-admin is redirected with `not_authorized`.
4. **Sign-in is client-side.** `AdminLoginForm` calls `supabase.auth.signInWithPassword()` with the browser client; `@supabase/ssr` writes the session cookies, then the user is routed to `/admin`.
5. **Server Actions re-verify independently.** Every admin mutation calls `getAdminUser()`, which re-reads the session server-side and re-checks the allowlist. Middleware protection is never the sole authorization for a mutation.
6. **Sign-out** is a Server Action that calls `supabase.auth.signOut()` and redirects to `/admin/login`.

Admin identity lives in Supabase Auth, not in Postgres — there is no users or roles table. The browser only ever sees the public anon key; no service-role key is used.

## Runtime flows

### Registration

1. `submitRegistration` Server Action validates the payload with Zod.
2. `createRegistration` (`src/features/registration/service.ts`) checks conference settings, category/level rules, duplicate email/phone (unless `allowDuplicates`), and that the assembly belongs to the active conference.
3. If `requirePayment` is **false**, the registration is created as `CONFIRMED` with a registration code and ticket token, and a ticket row is issued.
4. If `requirePayment` is **true**, the registration is created as `PENDING_PAYMENT` and a Paystack checkout URL is returned.

### Payments

- Checkout initialization creates a `payments` row with a unique reference and returns Paystack's authorization URL (`callback_url` = `/register?payment=return`).
- The webhook handler verifies the `x-paystack-signature` HMAC-SHA512 against `PAYSTACK_SECRET_KEY`, ignores non-`charge.success` events, and reconciles inside a transaction.
- `payment_webhook_events` provides idempotency. On success, the payment is marked `SUCCESSFUL`, the registration becomes `CONFIRMED`, a registration code and ticket token are generated, and a ticket row is inserted.

### Ticketing

- Tickets are verified through `/api/tickets/verify/[token]`, which returns `valid`, status, name, and registration code.
- QR codes encode the verification URL, never attendee PII directly.

### Statistics

- `findStatistics()` in `src/features/dashboard/service.ts` computes confirmed totals, family breakdowns, assembly leaderboard, and category counts with SQL aggregates.
- The statistics page renders these with custom components (Recharts is installed but unused).

## Environment variables

| Variable | Used by |
| --- | --- |
| `DATABASE_URL` | Drizzle client and migrations |
| `NEXT_PUBLIC_APP_URL` | Paystack callback URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase clients and middleware |
| `NEXT_PUBLIC_SUPABASE_API_KEY` | Supabase clients and middleware (anon key) |
| `ADMIN_EMAILS` | Admin allowlist (comma-separated) |
| `PAYSTACK_SECRET_KEY` | Checkout initialization and webhook verification |

Declared in `.env.example` but not yet referenced in code: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `PAYMENT_PROVIDER`, `PAYSTACK_PUBLIC_KEY`, `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_PUBLIC_KEY`.

## Known gaps

- `email_logs` and `audit_logs` tables exist but no code writes to them. A React Email confirmation template exists, but no send path is implemented (Resend is installed, unused).
- `@tanstack/react-query`, `recharts`, and `@neondatabase/serverless` are dependencies with no imports in `src/`; the app uses `pg` + `drizzle-orm/node-postgres`.
- The registration lookup rate limiter is an in-memory `Map`, so it is per-instance and resets on deploy.
- No test framework is configured.
- Flutterwave env vars are placeholders; Paystack is the only implemented payment provider.
