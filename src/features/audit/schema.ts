import { jsonb, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "@/db/schema-helpers";

export const auditLogs = pgTable("audit_logs", {
  id: id(),
  actorId: uuid("actor_id"),
  action: varchar("action", { length: 120 }).notNull(),
  entityType: varchar("entity_type", { length: 80 }).notNull(),
  entityId: uuid("entity_id"),
  metadata: jsonb("metadata").notNull().default({}),
  ...timestamps,
});
