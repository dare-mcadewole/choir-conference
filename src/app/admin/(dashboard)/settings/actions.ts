"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as conferenceService from "@/features/conference/service";
import { getAdminUser } from "@/lib/supabase/server";

type SettingsActionState = {
  error?: string;
  success?: string;
} | null;

const dateSchema = z
  .union([z.iso.date(), z.literal("")])
  .transform((value) =>
    value ? new Date(`${value}T00:00:00.000Z`) : null,
  );

const settingsSchema = z
  .object({
    id: z.uuid("Invalid conference settings."),
    title: z.string().trim().min(1, "Enter a conference title.").max(200),
    theme: z.string().trim().min(1, "Enter a conference theme.").max(200),
    anchorScripture: z
      .string()
      .trim()
      .min(1, "Enter an anchor scripture.")
      .max(300),
    description: z
      .string()
      .trim()
      .max(10000)
      .transform((value) => value || null),
    eventStartDate: dateSchema,
    eventEndDate: dateSchema,
    venue: z
      .string()
      .trim()
      .max(2000)
      .transform((value) => value || null),
    contactEmail: z
      .string()
      .trim()
      .max(255)
      .refine(
        (value) => !value || z.email().safeParse(value).success,
        "Enter a valid contact email.",
      )
      .transform((value) => value || null),
    contactPhone: z
      .string()
      .trim()
      .max(40)
      .transform((value) => value || null),
    registrationOpen: z.boolean(),
    allowDuplicates: z.boolean(),
    requirePayment: z.boolean(),
    showCountdownTimer: z.boolean(),
  })
  .superRefine((settings, context) => {
    if (
      settings.eventStartDate &&
      settings.eventEndDate &&
      settings.eventEndDate < settings.eventStartDate
    ) {
      context.addIssue({
        code: "custom",
        path: ["eventEndDate"],
        message: "The event end date must be on or after the start date.",
      });
    }
  });

export async function updateConferenceSettingsAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const parsed = settingsSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    theme: formData.get("theme"),
    anchorScripture: formData.get("anchorScripture"),
    description: formData.get("description"),
    eventStartDate: formData.get("eventStartDate"),
    eventEndDate: formData.get("eventEndDate"),
    venue: formData.get("venue"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    registrationOpen: formData.get("registrationOpen") === "true",
    allowDuplicates: formData.get("allowDuplicates") === "true",
    requirePayment: formData.get("requirePayment") === "true",
    showCountdownTimer: formData.get("showCountdownTimer") === "true",
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the conference settings.",
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

  const { id, ...settings } = parsed.data;
  try {
    await conferenceService.updateSettings(id, settings);
  } catch (error) {
    if (error instanceof conferenceService.ConferenceSettingsError) {
      return { error: error.message };
    }
    console.error("Could not update conference settings.", error);
    return {
      error: "Could not update conference settings. Please try again.",
    };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: "Conference settings saved." };
}
