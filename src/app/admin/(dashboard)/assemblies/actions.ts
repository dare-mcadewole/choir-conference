"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as assemblyService from "@/features/assembly/service";
import { AssemblyCreateError } from "@/features/assembly/service";
import { slugifyName } from "@/features/shared/utils/slug";
import { getAdminUser } from "@/lib/supabase/server";

type CreateAssemblyState = {
  error?: string;
  success?: string;
} | null;

const createAssemblySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter an assembly name.")
    .max(160)
    .refine(
      (name) => Boolean(slugifyName(name, 180)),
      "Use a name containing letters or numbers to generate a slug.",
    ),
});

export async function createAssemblyAction(
  _previousState: CreateAssemblyState,
  formData: FormData,
): Promise<CreateAssemblyState> {
  const parsed = createAssemblySchema.safeParse({
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the assembly name.",
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
    await assemblyService.create(parsed.data.name);
  } catch (error) {
    if (error instanceof AssemblyCreateError) {
      return { error: error.message };
    }
    console.error("Could not create assembly.", error);
    return { error: "Could not create this assembly. Please try again." };
  }

  revalidatePath("/admin/assemblies");
  revalidatePath("/admin/families");
  return { success: "Assembly created." };
}
