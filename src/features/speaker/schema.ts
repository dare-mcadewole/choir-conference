import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "@/db/schema-helpers";

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
