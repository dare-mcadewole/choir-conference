import {
  boolean,
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

export const ticketStatus = pgEnum("ticket_status", [
  "VALID",
  "CANCELLED",
  "USED",
]);

export const ticketTypes = pgTable(
  "ticket_types",
  {
    id: id(),
    name: varchar("name", { length: 80 }).notNull(),
    categorySlug: varchar("category_slug", { length: 100 }).notNull(),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("NGN"),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (table) => [uniqueIndex("ticket_type_category_unique").on(table.categorySlug)],
);

export const tickets = pgTable(
  "tickets",
  {
    id: id(),
    registrationId: uuid("registration_id")
      .notNull()
      .references(() => registrations.id, { onDelete: "restrict" }),
    token: varchar("token", { length: 80 }).notNull(),
    status: ticketStatus("status").notNull().default("VALID"),
    issuedAt: timestamp("issued_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("ticket_token_unique").on(table.token),
    uniqueIndex("ticket_registration_unique").on(table.registrationId),
  ],
);
