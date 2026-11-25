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
  assemblyId: z.uuid("Choose an assembly."),
});

export async function addAssemblyToFamilyAction(
  _previousState: AssignmentState,
  formData: FormData,
): Promise<AssignmentState> {
  const parsed = assignmentSchema.safeParse({
    familyId: formData.get("familyId"),
    assemblyId: formData.get("assemblyId"),
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

  try {
    await familyService.addAssemblyToFamily(
      parsed.data.familyId,
      parsed.data.assemblyId,
    );
  } catch (error) {
    if (error instanceof FamilyAssignmentError) {
      return { error: error.message };
    }
    console.error("Could not add assembly to family.", error);
    return { error: "Could not add this assembly. Please try again." };
  }

  revalidatePath("/admin/families");
  return { success: "Assembly added to this family." };
}
