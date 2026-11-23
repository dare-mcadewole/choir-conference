import {
  index,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "@/db/schema-helpers";
import { registrations } from "@/features/registration/schema";

export const paymentStatus = pgEnum("payment_status", [
  "PENDING",
  "SUCCESSFUL",
  "FAILED",
  "REFUNDED",
]);

export const payments = pgTable(
  "payments",
  {
    id: id(),
    registrationId: uuid("registration_id")
      .notNull()
      .references(() => registrations.id, { onDelete: "restrict" }),
    provider: varchar("provider", { length: 50 }).notNull(),
    reference: varchar("reference", { length: 120 }).notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("NGN"),
    status: paymentStatus("status").notNull().default("PENDING"),
    providerPayload: jsonb("provider_payload"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("payment_reference_unique").on(table.reference),
    index("payment_registration_idx").on(table.registrationId),
  ],
);

export const webhookEvents = pgTable(
  "payment_webhook_events",
  {
    id: id(),
    provider: varchar("provider", { length: 50 }).notNull(),
    eventId: varchar("event_id", { length: 160 }).notNull(),
    payload: jsonb("payload").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("webhook_event_unique").on(table.provider, table.eventId),
  ],
);
