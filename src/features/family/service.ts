import { asc, countDistinct, eq, ilike, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { assemblies } from "@/features/assembly/schema";
import {
  conferenceFamilies,
  conferenceFamilyAssemblies,
} from "@/features/family/schema";
import { registrations } from "@/features/registration/schema";

export async function find(search?: string) {
  const db = getDb();
  const query = search?.trim();
  return db
    .select({
      id: conferenceFamilies.id,
      name: conferenceFamilies.name,
      alias: conferenceFamilies.alias,
      slug: conferenceFamilies.slug,
      icon: conferenceFamilies.icon,
      description: conferenceFamilies.description,
      whatsappUrl: conferenceFamilies.whatsappUrl,
      active: conferenceFamilies.active,
      assemblyNames: sql<string[]>`
        coalesce(
          array_agg(distinct ${assemblies.name})
            filter (where ${assemblies.name} is not null),
          ARRAY[]::text[]
        )
      `,
      assemblyCount: countDistinct(assemblies.id),
      registrationCount: countDistinct(registrations.id),
    })
    .from(conferenceFamilies)
    .leftJoin(
      conferenceFamilyAssemblies,
      eq(conferenceFamilies.id, conferenceFamilyAssemblies.familyId),
    )
    .leftJoin(
      assemblies,
      eq(conferenceFamilyAssemblies.assemblyId, assemblies.id),
    )
    .leftJoin(registrations, eq(assemblies.id, registrations.assemblyId))
    .where(query ? ilike(conferenceFamilies.name, `%${query}%`) : undefined)
    .groupBy(conferenceFamilies.id)
    .orderBy(asc(conferenceFamilies.name));
}
