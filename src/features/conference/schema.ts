import {
  boolean,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "@/db/schema-helpers";
import { relations } from "drizzle-orm";
import { conferenceFamilyAssemblies } from "@/db/schema";

export const conference = pgTable("conference", {
  id: id(),
  title: varchar("title", { length: 200 }).notNull(),
  theme: varchar("theme", { length: 200 }).notNull(),
  anchorScripture: varchar("anchor_scripture", { length: 300 }).notNull(),
  description: text("description"),
  eventStartDate: timestamp("event_start_date", { withTimezone: true }),
  eventEndDate: timestamp("event_end_date", { withTimezone: true }),
  venue: text("venue"),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 40 }),
  registrationOpen: boolean("registration_open").notNull().default(true),
  registrationLookupEnabled: boolean("registration_lookup_enabled")
    .notNull()
    .default(true),
  historicalLookupEnabled: boolean("historical_lookup_enabled")
    .notNull()
    .default(true),
  allowDuplicates: boolean("allow_duplicates").notNull().default(false),
  requirePayment: boolean("require_payment").notNull().default(false),
  opensAt: timestamp("opens_at", { withTimezone: true }),
  closesAt: timestamp("closes_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true),
  ...timestamps,
});

export const conferenceRelations = relations(conference, ({ many }) => ({
  conferenceFamilyAssemblies: many(conferenceFamilyAssemblies),
}));
