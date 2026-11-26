import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { speakers } from "@/features/speaker/schema";

export async function findAdminSpeakers() {
  const db = getDb();
  return db
    .select()
    .from(speakers)
    .orderBy(asc(speakers.sortOrder), asc(speakers.fullName));
}

export type AdminSpeaker = Awaited<
  ReturnType<typeof findAdminSpeakers>
>[number];

export type AdminSpeakerUpdate = {
  fullName: string;
  designation: string | null;
  organization: string | null;
  biography: string | null;
  imageUrl: string | null;
  htmlClassName: string | null;
  published: boolean;
  sortOrder: number;
};

export class SpeakerUpdateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpeakerUpdateError";
  }
}

export async function createAdminSpeaker(details: AdminSpeakerUpdate) {
  const db = getDb();
  await db.insert(speakers).values(details);
}

export async function updateAdminSpeaker(
  id: string,
  details: AdminSpeakerUpdate,
) {
  const db = getDb();
  const [updated] = await db
    .update(speakers)
    .set({ ...details, updatedAt: new Date() })
    .where(eq(speakers.id, id))
    .returning({ id: speakers.id });

  if (!updated) {
    throw new SpeakerUpdateError("Speaker was not found.");
  }
}

export async function findPublished() {
  const db = getDb();
  return db
    .select()
    .from(speakers)
    .where(eq(speakers.published, true))
    .orderBy(asc(speakers.sortOrder));
}
