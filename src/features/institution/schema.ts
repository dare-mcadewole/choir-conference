import { boolean, integer, pgEnum, pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "@/db/schema-helpers";

export const institutionType = pgEnum("institution_type", ["SECONDARY", "TERTIARY"]);

export const institutions = pgTable("institutions", {
  id: id(),
  name: varchar("name", { length: 200 }).notNull(),
  type: institutionType("type").notNull(),
  active: boolean("active").notNull().default(true),
  ...timestamps,
}, (table) => [uniqueIndex("institution_name_unique").on(table.name)]);

export const academicLevels = pgTable("academic_levels", {
  id: id(),
  name: varchar("name", { length: 80 }).notNull(),
  institutionType: institutionType("institution_type").notNull(),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});
