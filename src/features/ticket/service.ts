import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { assemblies } from "@/features/assembly/schema";
import {
  conferenceFamilies,
  conferenceFamilyAssemblies,
} from "@/features/family/schema";
import { registrations } from "@/features/registration/schema";
import { tickets } from "@/features/ticket/schema";

export async function findOneByToken(token: string) {
  const db = getDb();
  return (
    await db
      .select({
        status: tickets.status,
        fullName: registrations.fullName,
        code: registrations.registrationCode,
        assembly: assemblies.name,
        family: conferenceFamilies.name,
      })
      .from(tickets)
      .innerJoin(registrations, eq(tickets.registrationId, registrations.id))
      .leftJoin(assemblies, eq(registrations.assemblyId, assemblies.id))
      .leftJoin(
        conferenceFamilyAssemblies,
        eq(assemblies.id, conferenceFamilyAssemblies.assemblyId),
      )
      .leftJoin(
        conferenceFamilies,
        eq(conferenceFamilyAssemblies.familyId, conferenceFamilies.id),
      )
      .where(eq(tickets.token, token))
      .limit(1)
  )[0];
}

export async function findOneForVerification(token: string) {
  const db = getDb();
  return (
    await db
      .select({
        status: tickets.status,
        fullName: registrations.fullName,
        code: registrations.registrationCode,
      })
      .from(tickets)
      .innerJoin(registrations, eq(tickets.registrationId, registrations.id))
      .where(eq(tickets.token, token))
      .limit(1)
  )[0];
}
