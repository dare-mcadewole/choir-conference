import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export function getDb() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is not configured.");

  return drizzle({
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    },
    schema,
  });
}

export type Database = ReturnType<typeof getDb>;
