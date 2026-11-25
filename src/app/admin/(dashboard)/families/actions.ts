"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  FamilyAssignmentError,
  FamilyDetailsError,
} from "@/features/family/service";
import { slugifyFamilyName } from "@/features/family/slug";
import * as familyService from "@/features/family/service";
import { getAdminUser } from "@/lib/supabase/server";

type FamilyActionState = {
  error?: string;
  success?: string;
} | null;

const assignmentSchema = z.object({
  familyId: z.uuid("Choose a family."),
  assemblyIds: z
    .array(z.uuid("Choose valid assemblies."))
    .refine(
      (assemblyIds) => new Set(assemblyIds).size === assemblyIds.length,
      "Remove duplicate assemblies from your selection.",
    ),
});

const familyDetailsSchema = z.object({
  familyId: z.uuid("Choose a valid family."),
  name: z
    .string()
    .trim()
    .min(1, "Enter a family name.")
    .max(80)
    .refine(
      (name) => Boolean(slugifyFamilyName(name)),
      "Use a family name containing letters or numbers to generate its slug.",
    ),
  alias: z
    .string()
    .trim()
    .max(140)
    .transform((value) => value || null),
  description: z
    .string()
    .trim()
    .transform((value) => value || null),
  whatsappUrl: z
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
    }, "Enter a valid HTTP or HTTPS URL.")
    .transform((value) => value || null),
});

export async function updateFamilyDetailsAction(
  _previousState: FamilyActionState,
  formData: FormData,
): Promise<FamilyActionState> {
  const parsed = familyDetailsSchema.safeParse({
    familyId: formData.get("familyId"),
    name: formData.get("name"),
    alias: formData.get("alias"),
    description: formData.get("description"),
    whatsappUrl: formData.get("whatsappUrl"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the family details.",
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

  const { familyId, ...details } = parsed.data;
  try {
    await familyService.updateDetails(familyId, {
      ...details,
      slug: slugifyFamilyName(details.name),
    });
  } catch (error) {
    if (error instanceof FamilyDetailsError) {
      return { error: error.message };
    }
    console.error("Could not update family details.", error);
    return { error: "Could not update this family. Please try again." };
  }

  revalidatePath("/admin/families");
  return { success: "Family details updated." };
}

export async function updateFamilyAssembliesAction(
  _previousState: FamilyActionState,
  formData: FormData,
): Promise<FamilyActionState> {
  const parsed = assignmentSchema.safeParse({
    familyId: formData.get("familyId"),
    assemblyIds: formData.getAll("assemblyIds"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Choose a valid assembly.",
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

  let changes: { added: number; removed: number };
  try {
    changes = await familyService.setAssembliesForFamily(
      parsed.data.familyId,
      parsed.data.assemblyIds,
    );
  } catch (error) {
    if (error instanceof FamilyAssignmentError) {
      return { error: error.message };
    }
    console.error("Could not update family assemblies.", error);
    return { error: "Could not update this family's assemblies. Please try again." };
  }

  revalidatePath("/admin/families");
  const messages = [];
  if (changes.added) {
    messages.push(
      `${changes.added} ${changes.added === 1 ? "assembly" : "assemblies"} added`,
    );
  }
  if (changes.removed) {
    messages.push(
      `${changes.removed} ${
        changes.removed === 1 ? "assembly" : "assemblies"
      } removed`,
    );
  }
  return {
    success: messages.length
      ? `${messages.join(" and ")}.`
      : "The assembly list is unchanged.",
  };
}
