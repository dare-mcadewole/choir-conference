import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { speakers } from "@/features/speaker/schema";

export async function findPublished() {
  const db = getDb();
  return db
    .select()
    .from(speakers)
    .where(eq(speakers.published, true))
    .orderBy(asc(speakers.sortOrder));
}
