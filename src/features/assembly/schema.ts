import {
  boolean,
  index,
  pgTable,
  uuid,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "@/db/schema-helpers";
import { conferenceFamilies } from "@/features/family/schema";

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
  (table) => [
    uniqueIndex("assembly_slug_unique").on(table.slug),
    index("assembly_family_idx").on(table.familyId),
  ],
);
