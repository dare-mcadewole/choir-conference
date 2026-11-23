# All Choirs' Conference 2027

Production-oriented registration, ticketing, payment and conference-management foundation built with Next.js, TypeScript, PostgreSQL and Drizzle.

## Run locally

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL` plus `AUTH_SECRET`. Add the Resend and Paystack values only when those integrations are enabled.
2. Install dependencies with `npm install`.
3. Generate and apply the database migration: `npm run db:generate && npm run db:migrate`.
4. Load the initial settings, families, pricing, categories, positions and academic levels: `npm run db:seed`.
5. Add real assemblies from the protected administration area before opening registration.
6. Start the app with `npm run dev`.

The system deliberately does not invent event dates, venues, speakers or assemblies. These are runtime-managed records.

## Security notes

- Registration lookup uses normalized contact data, rate-limits requests, and returns no registrant data for current registrations.
- Pricing, family assignment, duplicate checks and confirmation occur server-side.
- Paystack webhook processing verifies the HMAC signature and has an idempotent event log.
- Ticket QR values are opaque verification URLs, never attendee PII.

Before production, configure an authentication provider / admin user identity integration and complete the admin CRUD routes for your chosen identity provider. These are intentionally not permissive fallbacks.
