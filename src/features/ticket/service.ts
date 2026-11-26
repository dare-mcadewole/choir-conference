import { desc, eq, ilike, or } from "drizzle-orm";
import { getDb } from "@/db";
import { assemblies } from "@/features/assembly/schema";
import {
  conferenceFamilies,
  conferenceFamilyAssemblies,
} from "@/features/family/schema";
import {
  registrationCategories,
  registrations,
} from "@/features/registration/schema";
import { ticketTypes, tickets } from "@/features/ticket/schema";

export async function findAdminTickets(search?: string) {
  const db = getDb();
  const query = search?.trim();
  return db
    .select({
      id: tickets.id,
      status: tickets.status,
      issuedAt: tickets.issuedAt,
      usedAt: tickets.usedAt,
      fullName: registrations.fullName,
      email: registrations.email,
      phone: registrations.phone,
      registrationCode: registrations.registrationCode,
      assembly: assemblies.name,
    })
    .from(tickets)
    .innerJoin(registrations, eq(tickets.registrationId, registrations.id))
    .leftJoin(assemblies, eq(registrations.assemblyId, assemblies.id))
    .where(
      query
        ? or(
            ilike(registrations.fullName, `%${query}%`),
            ilike(registrations.email, `%${query}%`),
            ilike(registrations.phone, `%${query}%`),
            ilike(registrations.registrationCode, `%${query}%`),
          )
        : undefined,
    )
    .orderBy(desc(tickets.issuedAt));
}

export async function findOneByToken(token: string) {
  const db = getDb();
  const [row] = await db
    .select({
      status: tickets.status,
      fullName: registrations.fullName,
      code: registrations.registrationCode,
      assembly: assemblies.name,
      family: conferenceFamilies.name,
      categorySlug: registrationCategories.slug,
    })
    .from(tickets)
    .innerJoin(registrations, eq(tickets.registrationId, registrations.id))
    .innerJoin(
      registrationCategories,
      eq(registrations.categoryId, registrationCategories.id),
    )
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
    .limit(1);

  if (!row) return undefined;

  const [ticketType] = await db
    .select({ price: ticketTypes.price })
    .from(ticketTypes)
    .where(
      eq(
        ticketTypes.slug,
        row.categorySlug === "student" ? "student" : "non-student",
      ),
    )
    .limit(1);

  return {
    status: row.status,
    fullName: row.fullName,
    code: row.code,
    assembly: row.assembly,
    family: row.family,
    amount: ticketType?.price ?? null,
  };
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
