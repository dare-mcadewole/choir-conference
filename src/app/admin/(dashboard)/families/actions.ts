"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { FamilyAssignmentError } from "@/features/family/service";
import * as familyService from "@/features/family/service";
import { getAdminUser } from "@/lib/supabase/server";

type AssignmentState = {
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

export async function updateFamilyAssembliesAction(
  _previousState: AssignmentState,
  formData: FormData,
): Promise<AssignmentState> {
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
    return { error: "Could not verify administrator access. Please sign in again." };
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
