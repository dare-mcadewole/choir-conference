import { count, desc, eq, ilike, or, sql, sum } from "drizzle-orm";
import { getDb } from "@/db";
import { assemblies } from "@/features/assembly/schema";
import {
  conferenceFamilies,
  conferenceFamilyAssemblies,
} from "@/features/family/schema";
import { payments } from "@/features/payment/schema";
import {
  registrationCategories,
  registrations,
} from "@/features/registration/schema";

export async function findStatistics() {
  const db = getDb();
  const [total] = await db
    .select({ total: count() })
    .from(registrations)
    .where(eq(registrations.status, "CONFIRMED"));
  const families = await db
    .select({
      name: conferenceFamilies.name,
      alias: conferenceFamilies.alias,
      total: count(registrations.id),
    })
    .from(conferenceFamilies)
    .leftJoin(
      conferenceFamilyAssemblies,
      eq(conferenceFamilies.id, conferenceFamilyAssemblies.familyId),
    )
    .leftJoin(
      registrations,
      eq(conferenceFamilyAssemblies.assemblyId, registrations.assemblyId),
    )
    .groupBy(conferenceFamilies.id)
    .orderBy(conferenceFamilies.name);
  const leaderboard = await db
    .select({
      id: assemblies.id,
      name: assemblies.name,
      family: conferenceFamilies.name,
      total: count(registrations.id),
    })
    .from(assemblies)
    .leftJoin(
      conferenceFamilyAssemblies,
      eq(assemblies.id, conferenceFamilyAssemblies.assemblyId),
    )
    .leftJoin(
      conferenceFamilies,
      eq(conferenceFamilyAssemblies.familyId, conferenceFamilies.id),
    )
    .leftJoin(registrations, eq(assemblies.id, registrations.assemblyId))
    .groupBy(assemblies.id, conferenceFamilies.name)
    .orderBy(sql`${count(registrations.id)} desc`);
  const categories = await db
    .select({
      slug: registrationCategories.slug,
      name: registrationCategories.name,
      total: count(registrations.id),
    })
    .from(registrationCategories)
    .leftJoin(
      registrations,
      eq(registrationCategories.id, registrations.categoryId),
    )
    .groupBy(registrationCategories.id);
  return { total: total?.total ?? 0, families, leaderboard, categories };
}
export type StatisticalBreakdown = Awaited<ReturnType<typeof findStatistics>>;

export async function findAdminOverview() {
  const db = getDb();
  const [all, confirmed, pending, paid, revenue, assemblyCount] =
    await Promise.all([
      db.select({ value: count() }).from(registrations),
      db
        .select({ value: count() })
        .from(registrations)
        .where(eq(registrations.status, "CONFIRMED")),
      db
        .select({ value: count() })
        .from(registrations)
        .where(eq(registrations.status, "PENDING_PAYMENT")),
      db
        .select({ value: count() })
        .from(payments)
        .where(eq(payments.status, "SUCCESSFUL")),
      db
        .select({ value: sum(payments.amount) })
        .from(payments)
        .where(eq(payments.status, "SUCCESSFUL")),
      db.select({ value: count() }).from(assemblies),
    ]);
  return {
    all: all[0]?.value ?? 0,
    confirmed: confirmed[0]?.value ?? 0,
    pending: pending[0]?.value ?? 0,
    paid: paid[0]?.value ?? 0,
    revenue: revenue[0]?.value ?? "0",
    assemblies: assemblyCount[0]?.value ?? 0,
  };
}

export async function findRecentRegistrations(search?: string) {
  const db = getDb();
  const query = search?.trim();
  return db
    .select({
      id: registrations.id,
      fullName: registrations.fullName,
      email: registrations.email,
      status: registrations.status,
      createdAt: registrations.createdAt,
      assembly: assemblies.name,
    })
    .from(registrations)
    .leftJoin(assemblies, eq(registrations.assemblyId, assemblies.id))
    .where(
      query
        ? or(
            ilike(registrations.fullName, `%${query}%`),
            ilike(registrations.email, `%${query}%`),
          )
        : undefined,
    )
    .orderBy(desc(registrations.createdAt))
    .limit(6);
}
