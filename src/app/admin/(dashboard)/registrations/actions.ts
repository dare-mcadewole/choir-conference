"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PhoneSchema } from "@/features/shared/validation";
import * as registrationService from "@/features/registration/service";
import { VOCAL_PART_OPTIONS } from "@/features/registration/schema";
import { getAdminUser } from "@/lib/supabase/server";

type RegistrationActionState = {
  error?: string;
  success?: string;
} | null;

const updateRegistrationSchema = z.object({
  registrationId: z.uuid("Choose a valid registration."),
  fullName: z.string().trim().min(2, "Enter a full name.").max(200),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  phone: PhoneSchema,
  gender: z.enum(["MALE", "FEMALE"]),
  assemblyId: z.uuid("Choose an assembly."),
  categoryId: z.uuid("Choose a category."),
  part: z.enum(VOCAL_PART_OPTIONS),
  centralChoirMember: z.boolean(),
  institution: z
    .string()
    .trim()
    .max(360)
    .transform((value) => value || null),
  academicLevelId: z.uuid().nullable(),
  positionIds: z
    .array(z.uuid())
    .refine(
      (positionIds) => new Set(positionIds).size === positionIds.length,
      "Remove duplicate positions.",
    ),
});

export async function updateRegistrationAction(
  _previousState: RegistrationActionState,
  formData: FormData,
): Promise<RegistrationActionState> {
  const parsed = updateRegistrationSchema.safeParse({
    registrationId: formData.get("registrationId"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    gender: formData.get("gender"),
    assemblyId: formData.get("assemblyId"),
    categoryId: formData.get("categoryId"),
    part: formData.get("part"),
    centralChoirMember: formData.get("centralChoirMember") === "true",
    institution: formData.get("institution") ?? "",
    academicLevelId: formData.get("academicLevelId") || null,
    positionIds: formData.getAll("positionIds"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the registration details.",
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

  const { registrationId, ...details } = parsed.data;
  try {
    await registrationService.updateAdminRegistration(registrationId, details);
  } catch (error) {
    if (error instanceof registrationService.RegistrationUpdateError) {
      return { error: error.message };
    }
    console.error("Could not update registration details.", error);
    return {
      error: "Could not update this registration. Please try again.",
    };
  }

  revalidatePath("/admin/registrations");
  revalidatePath("/admin");
  return { success: "Registration details updated." };
}
