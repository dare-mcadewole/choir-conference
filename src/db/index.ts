import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

export function getDb() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is not configured.");

  return drizzle({
    connection: {
      connectionString: process.env.DATABASE_URL,
    },
    schema,
  });
}

export type Database = ReturnType<typeof getDb>;
