import {
  boolean,
  pgTable,
  text,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "@/db/schema-helpers";
import { assemblies, conference } from "@/db/schema";
import { relations } from "drizzle-orm";

export const conferenceFamilies = pgTable(
  "conference_families",
  {
    id: id(),
    name: varchar("name", { length: 80 }).notNull(),
    alias: varchar("alias", { length: 140 }),
    slug: varchar("slug", { length: 80 }).notNull(),
    icon: varchar("icon", { length: 60 }).notNull(),
    description: text("description"),
    whatsappUrl: text("whatsapp_url"),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (table) => [uniqueIndex("family_slug_unique").on(table.slug)],
);

export const conferenceFamilyAssemblies = pgTable(
  "conference_family_assemblies",
  {
    id: id(),
    conferenceId: uuid("conference_id")
      .notNull()
      .references(() => conference.id, {
        onDelete: "cascade",
      }),
    familyId: uuid("family_id")
      .notNull()
      .references(() => conferenceFamilies.id, {
        onDelete: "cascade",
      }),
    assemblyId: uuid("assembly_id")
      .notNull()
      .references(() => assemblies.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    unique("conference_family_assembly_unique").on(
      table.conferenceId,
      table.familyId,
      table.assemblyId,
    ),
    uniqueIndex("family_assembly_unique_index").on(
      table.familyId,
      table.assemblyId,
    ),
  ],
);

export const conferenceFamilyRelations = relations(
  conferenceFamilies,
  ({ many }) => ({
    conferenceFamilyAssemblies: many(conferenceFamilyAssemblies),
  }),
);

export const conferenceFamilyAssemblyRelations = relations(
  conferenceFamilyAssemblies,
  ({ one }) => ({
    conference: one(conference, {
      fields: [conferenceFamilyAssemblies.conferenceId],
      references: [conference.id],
    }),
    family: one(conferenceFamilies, {
      fields: [conferenceFamilyAssemblies.familyId],
      references: [conferenceFamilies.id],
    }),
    assembly: one(assemblies, {
      fields: [conferenceFamilyAssemblies.assemblyId],
      references: [assemblies.id],
    }),
  }),
);
