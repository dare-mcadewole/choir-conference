import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").defaultRandom().primaryKey();
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const registrationStatus = pgEnum("registration_status", [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "CANCELLED",
  "EXPIRED",
]);
export const paymentStatus = pgEnum("payment_status", [
  "PENDING",
  "SUCCESSFUL",
  "FAILED",
  "REFUNDED",
]);
export const ticketStatus = pgEnum("ticket_status", [
  "VALID",
  "CANCELLED",
  "USED",
]);
export const institutionType = pgEnum("institution_type", [
  "SECONDARY",
  "TERTIARY",
]);

export const conferenceSettings = pgTable("conference_settings", {
  id: id(),
  title: varchar("title", { length: 200 })
    .notNull()
    .default("All Choirs' Conference 2027"),
  theme: varchar("theme", { length: 200 })
    .notNull()
    .default("THE ABLE MINISTER"),
  description: text("description"),
  eventDate: timestamp("event_date", { withTimezone: true }),
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
  ...timestamps,
});

export const conferenceFamilies = pgTable(
  "conference_families",
  {
    id: id(),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 80 }).notNull(),
    icon: varchar("icon", { length: 60 }).notNull(),
    description: text("description"),
    whatsappUrl: text("whatsapp_url"),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (t) => [uniqueIndex("family_slug_unique").on(t.slug)],
);

export const assemblies = pgTable(
  "assemblies",
  {
    id: id(),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
    familyId: uuid("family_id").references(() => conferenceFamilies.id, {
      onDelete: "restrict",
    }),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("assembly_slug_unique").on(t.slug),
    index("assembly_family_idx").on(t.familyId),
  ],
);

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
  (t) => [uniqueIndex("category_slug_unique").on(t.slug)],
);
export const positionOptions = pgTable("position_options", {
  id: id(),
  name: varchar("name", { length: 120 }).notNull(),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});
export const institutions = pgTable(
  "institutions",
  {
    id: id(),
    name: varchar("name", { length: 200 }).notNull(),
    type: institutionType("type").notNull(),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (t) => [uniqueIndex("institution_name_unique").on(t.name)],
);
export const academicLevels = pgTable("academic_levels", {
  id: id(),
  name: varchar("name", { length: 80 }).notNull(),
  institutionType: institutionType("institution_type").notNull(),
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
  (t) => [
    uniqueIndex("registration_code_unique").on(t.registrationCode),
    index("registration_email_idx").on(t.normalizedEmail),
    index("registration_phone_idx").on(t.normalizedPhone),
    index("registration_assembly_idx").on(t.assemblyId),
    index("registration_status_idx").on(t.status),
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
  (t) => [
    uniqueIndex("registration_position_unique").on(
      t.registrationId,
      t.positionId,
    ),
  ],
);
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
  (t) => [uniqueIndex("ticket_type_category_unique").on(t.categorySlug)],
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
  (t) => [
    uniqueIndex("ticket_token_unique").on(t.token),
    uniqueIndex("ticket_registration_unique").on(t.registrationId),
  ],
);
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
  (t) => [
    uniqueIndex("payment_reference_unique").on(t.reference),
    index("payment_registration_idx").on(t.registrationId),
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
  (t) => [uniqueIndex("webhook_event_unique").on(t.provider, t.eventId)],
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
  (t) => [
    index("historical_email_idx").on(t.normalizedEmail),
    index("historical_phone_idx").on(t.normalizedPhone),
  ],
);
export const speakers = pgTable("speakers", {
  id: id(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  designation: varchar("designation", { length: 160 }),
  organization: varchar("organization", { length: 160 }),
  biography: text("biography"),
  imageUrl: text("image_url"),
  links: jsonb("links").notNull().default({}),
  published: boolean("published").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});
export const emailLogs = pgTable("email_logs", {
  id: id(),
  registrationId: uuid("registration_id").references(() => registrations.id),
  type: varchar("type", { length: 80 }).notNull(),
  recipient: varchar("recipient", { length: 255 }).notNull(),
  providerId: varchar("provider_id", { length: 120 }),
  status: varchar("status", { length: 40 }).notNull(),
  error: text("error"),
  ...timestamps,
});
export const auditLogs = pgTable("audit_logs", {
  id: id(),
  actorId: uuid("actor_id"),
  action: varchar("action", { length: 120 }).notNull(),
  entityType: varchar("entity_type", { length: 80 }).notNull(),
  entityId: uuid("entity_id"),
  metadata: jsonb("metadata").notNull().default({}),
  ...timestamps,
});
