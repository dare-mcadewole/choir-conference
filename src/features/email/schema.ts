import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "@/db/schema-helpers";
import { registrations } from "@/features/registration/schema";

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
