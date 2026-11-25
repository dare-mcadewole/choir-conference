# All Choirs' Conference 2027

Production-oriented registration, ticketing, payment and conference-management foundation built with Next.js, TypeScript, PostgreSQL and Drizzle.

## Run locally

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_API_KEY`, and `ADMIN_EMAILS`. `ADMIN_EMAILS` is a comma-separated allowlist of administrator email addresses. Add the Resend and Paystack values only when those integrations are enabled.
2. Install dependencies with `npm install`.
3. Generate and apply the database migration: `npm run db:generate && npm run db:migrate`.
4. Load the initial settings, families, pricing, categories, positions and academic levels: `npm run db:seed`.
5. Create or invite administrator accounts in Supabase Auth. Disable public sign-ups and only list trusted administrator addresses in `ADMIN_EMAILS`.
6. Add real assemblies from the protected administration area before opening registration.
7. Start the app with `npm run dev`.

The system deliberately does not invent event dates, venues, speakers or assemblies. These are runtime-managed records.

## Security notes

- Registration lookup uses normalized contact data, rate-limits requests, and returns no registrant data for current registrations.
- Pricing, family assignment, duplicate checks and confirmation occur server-side.
- Admin routes use Supabase Auth sessions and require an email in the server-side `ADMIN_EMAILS` allowlist. Family-to-assembly assignment actions verify the session and allowlist again.
- Never expose a Supabase service-role key to the browser; this integration only uses the public anon key and server-verified user sessions.
- Paystack webhook processing verifies the HMAC signature and has an idempotent event log.
- Ticket QR values are opaque verification URLs, never attendee PII.

Complete the remaining admin CRUD routes before production. Admin access fails closed when Supabase configuration or the allowlist is missing.
