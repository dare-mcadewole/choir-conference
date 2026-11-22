"use server";
import { registrationSchema } from "@/features/registration/schema";
import { createRegistration } from "@/features/registration/service";

export async function submitRegistration(payload: unknown) {
  const parsed = registrationSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Please review the form." };
  try { const result = await createRegistration(parsed.data); return { ok: true as const, ...result }; }
  catch (error) { return { ok: false as const, error: error instanceof Error ? error.message : "Registration could not be completed." }; }
}
