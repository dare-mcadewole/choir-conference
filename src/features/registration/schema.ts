import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "@/db/schema-helpers";
import { assemblies } from "@/features/assembly/schema";
import { conferenceFamilies } from "@/features/family/schema";
import { academicLevels, institutions } from "@/features/institution/schema";

export const registrationStatus = pgEnum("registration_status", [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "CANCELLED",
  "EXPIRED",
]);

export const registrationCategories = pgTable(
  "registration_categories",
  {
    id: id(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    active: boolean("active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [uniqueIndex("category_slug_unique").on(table.slug)],
);

export const positionOptions = pgTable("position_options", {
  id: id(),
  name: varchar("name", { length: 120 }).notNull(),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const registrations = pgTable(
  "registrations",
  {
    id: id(),
    fullName: varchar("full_name", { length: 200 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    normalizedEmail: varchar("normalized_email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),
    normalizedPhone: varchar("normalized_phone", { length: 50 }).notNull(),
    gender: varchar("gender", { length: 32 }).notNull(),
    assemblyId: uuid("assembly_id")
      .notNull()
      .references(() => assemblies.id),
    familyId: uuid("family_id")
      .notNull()
      .references(() => conferenceFamilies.id),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => registrationCategories.id),
    centralChoirMember: boolean("central_choir_member").notNull(),
    institutionId: uuid("institution_id").references(() => institutions.id),
    academicLevelId: uuid("academic_level_id").references(
      () => academicLevels.id,
    ),
    status: registrationStatus("status").notNull().default("PENDING_PAYMENT"),
    registrationCode: varchar("registration_code", { length: 20 }).unique(),
    ticketToken: varchar("ticket_token", { length: 80 }).unique(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("registration_code_unique").on(table.registrationCode),
    index("registration_email_idx").on(table.normalizedEmail),
    index("registration_phone_idx").on(table.normalizedPhone),
    index("registration_assembly_idx").on(table.assemblyId),
    index("registration_status_idx").on(table.status),
  ],
);

export const registrationPositions = pgTable(
  "registration_positions",
  {
    registrationId: uuid("registration_id")
      .notNull()
      .references(() => registrations.id, { onDelete: "cascade" }),
    positionId: uuid("position_id")
      .notNull()
      .references(() => positionOptions.id, { onDelete: "restrict" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("registration_position_unique").on(
      table.registrationId,
      table.positionId,
    ),
  ],
);

export const historicalRegistrants = pgTable(
  "historical_registrants",
  {
    id: id(),
    batchId: uuid("batch_id"),
    fullName: varchar("full_name", { length: 200 }).notNull(),
    email: varchar("email", { length: 255 }),
    normalizedEmail: varchar("normalized_email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    normalizedPhone: varchar("normalized_phone", { length: 50 }),
    data: jsonb("data").notNull().default({}),
    ...timestamps,
  },
  (table) => [
    index("historical_email_idx").on(table.normalizedEmail),
    index("historical_phone_idx").on(table.normalizedPhone),
  ],
);
