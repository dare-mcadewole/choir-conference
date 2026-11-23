import { boolean, pgTable, text, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "@/db/schema-helpers";

export const conferenceFamilies = pgTable("conference_families", {
  id: id(),
  name: varchar("name", { length: 80 }).notNull(),
  slug: varchar("slug", { length: 80 }).notNull(),
  icon: varchar("icon", { length: 60 }).notNull(),
  description: text("description"),
  whatsappUrl: text("whatsapp_url"),
  active: boolean("active").notNull().default(true),
  ...timestamps,
}, (table) => [uniqueIndex("family_slug_unique").on(table.slug)]);
