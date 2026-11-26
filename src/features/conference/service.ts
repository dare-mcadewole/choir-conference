import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { conference } from "./schema";

export async function findOne() {
  const db = getDb();
  return db.query.conference.findFirst();
}

export type ConferenceSettings = NonNullable<
  Awaited<ReturnType<typeof findOne>>
>;

export type ConferenceSettingsUpdate = {
  title: string;
  theme: string;
  anchorScripture: string;
  description: string | null;
  eventStartDate: Date | null;
  eventEndDate: Date | null;
  venue: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  registrationOpen: boolean;
  allowDuplicates: boolean;
  requirePayment: boolean;
  showCountdownTimer: boolean;
};

export class ConferenceSettingsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConferenceSettingsError";
  }
}

export async function updateSettings(
  id: string,
  settings: ConferenceSettingsUpdate,
) {
  const db = getDb();
  const [updated] = await db
    .update(conference)
    .set({ ...settings, updatedAt: new Date() })
    .where(eq(conference.id, id))
    .returning({ id: conference.id });

  if (!updated) {
    throw new ConferenceSettingsError("Conference settings were not found.");
  }
}
