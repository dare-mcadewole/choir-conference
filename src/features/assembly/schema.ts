import {
  boolean,
  index,
  pgTable,
  uuid,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "@/db/schema-helpers";
import {
  conferenceFamilies,
  conferenceFamilyAssemblies,
} from "@/features/family/schema";
import { relations } from "drizzle-orm";

export const assemblies = pgTable(
  "assemblies",
  {
    id: id(),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("assembly_slug_unique").on(table.slug),
    // index("assembly_family_idx").on(table.familyId),
  ],
);

export const assemblyRelations = relations(assemblies, ({ many }) => ({
  conferenceFamilyAssemblies: many(conferenceFamilyAssemblies),
}));
