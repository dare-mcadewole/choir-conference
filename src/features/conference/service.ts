import { getDb } from "@/db";

export async function findOne() {
  const db = getDb();
  return db.query.conference.findFirst();
}
