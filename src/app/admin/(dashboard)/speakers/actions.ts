"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as speakerService from "@/features/speaker/service";
import { getAdminUser } from "@/lib/supabase/server";

type SpeakerActionState = {
  error?: string;
  success?: string;
} | null;

const nullableText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .transform((value) => value || null);

const imageUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "Enter an HTTP or HTTPS image URL.")
  .transform((value) => value || null);

const speakerDetailsSchema = z.object({
  fullName: z.string().trim().min(1, "Enter a speaker name.").max(160),
  designation: nullableText(160),
  organization: nullableText(160),
  biography: nullableText(10000),
  imageUrl: imageUrlSchema,
  htmlClassName: nullableText(2000),
  published: z.boolean(),
  sortOrder: z
    .string()
    .regex(/^\d+$/, "Enter a non-negative display order.")
    .transform(Number)
    .pipe(z.number().int().min(0).max(100000)),
});

const createSpeakerSchema = speakerDetailsSchema;

const updateSpeakerSchema = speakerDetailsSchema.extend({
  id: z.uuid("Choose a valid speaker."),
});

export async function createSpeakerAction(
  _previousState: SpeakerActionState,
  formData: FormData,
): Promise<SpeakerActionState> {
  const parsed = createSpeakerSchema.safeParse({
    fullName: formData.get("fullName"),
    designation: formData.get("designation"),
    organization: formData.get("organization"),
    biography: formData.get("biography"),
    imageUrl: formData.get("imageUrl"),
    htmlClassName: formData.get("htmlClassName"),
    published: formData.get("published") === "true",
    sortOrder: formData.get("sortOrder"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the speaker details.",
    };
  }

  let admin;
  try {
    admin = await getAdminUser();
  } catch (error) {
    console.error("Could not verify administrator session.", error);
    return {
      error: "Could not verify administrator access. Please sign in again.",
    };
  }
  if (!admin) {
    return { error: "Sign in with an approved administrator account." };
  }

  try {
    await speakerService.createAdminSpeaker(parsed.data);
  } catch (error) {
    console.error("Could not create speaker.", error);
    return { error: "Could not create this speaker. Please try again." };
  }

  revalidatePath("/admin/speakers");
  revalidatePath("/");
  return { success: "Speaker created." };
}

export async function updateSpeakerAction(
  _previousState: SpeakerActionState,
  formData: FormData,
): Promise<SpeakerActionState> {
  const parsed = updateSpeakerSchema.safeParse({
    id: formData.get("id"),
    fullName: formData.get("fullName"),
    designation: formData.get("designation"),
    organization: formData.get("organization"),
    biography: formData.get("biography"),
    imageUrl: formData.get("imageUrl"),
    htmlClassName: formData.get("htmlClassName"),
    published: formData.get("published") === "true",
    sortOrder: formData.get("sortOrder"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the speaker details.",
    };
  }

  let admin;
  try {
    admin = await getAdminUser();
  } catch (error) {
    console.error("Could not verify administrator session.", error);
    return {
      error: "Could not verify administrator access. Please sign in again.",
    };
  }
  if (!admin) {
    return { error: "Sign in with an approved administrator account." };
  }

  const { id, ...details } = parsed.data;
  try {
    await speakerService.updateAdminSpeaker(id, details);
  } catch (error) {
    if (error instanceof speakerService.SpeakerUpdateError) {
      return { error: error.message };
    }
    console.error("Could not update speaker details.", error);
    return { error: "Could not update this speaker. Please try again." };
  }

  revalidatePath("/admin/speakers");
  revalidatePath("/");
  return { success: "Speaker details updated." };
}
