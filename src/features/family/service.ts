import {
  and,
  asc,
  countDistinct,
  eq,
  ilike,
  inArray,
  sql,
} from "drizzle-orm";
import { getDb } from "@/db";
import { assemblies } from "@/features/assembly/schema";
import { conference } from "@/features/conference/schema";
import {
  conferenceFamilies,
  conferenceFamilyAssemblies,
} from "@/features/family/schema";
import { registrations } from "@/features/registration/schema";

export async function find(search?: string) {
  const db = getDb();
  const query = search?.trim();
  const activeConference = await db.query.conference.findFirst({
    where: eq(conference.isActive, true),
    columns: { id: true },
  });
  const assignmentJoin = activeConference
    ? and(
        eq(conferenceFamilies.id, conferenceFamilyAssemblies.familyId),
        eq(conferenceFamilyAssemblies.conferenceId, activeConference.id),
      )
    : sql`false`;
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
    .leftJoin(conferenceFamilyAssemblies, assignmentJoin)
    .leftJoin(
      assemblies,
      eq(conferenceFamilyAssemblies.assemblyId, assemblies.id),
    )
    .leftJoin(registrations, eq(assemblies.id, registrations.assemblyId))
    .where(query ? ilike(conferenceFamilies.name, `%${query}%`) : undefined)
    .groupBy(conferenceFamilies.id)
    .orderBy(asc(conferenceFamilies.name));
}

export type FamilySummary = Awaited<ReturnType<typeof find>>[number];

export type AssemblyOption = {
  id: string;
  name: string;
};

export async function findAssignmentOptions(familyIds: string[]) {
  const db = getDb();
  const activeConference = await db.query.conference.findFirst({
    where: eq(conference.isActive, true),
    columns: { id: true },
  });
  if (!activeConference) {
    return {
      conferenceAvailable: false,
      activeAssemblyCount: 0,
      availableByFamily: {} as Record<string, AssemblyOption[]>,
      assignedByFamily: {} as Record<string, AssemblyOption[]>,
    };
  }

  const assignments = familyIds.length
    ? await db
        .select({
          familyId: conferenceFamilyAssemblies.familyId,
          assemblyId: conferenceFamilyAssemblies.assemblyId,
          name: assemblies.name,
        })
        .from(conferenceFamilyAssemblies)
        .innerJoin(
          assemblies,
          eq(conferenceFamilyAssemblies.assemblyId, assemblies.id),
        )
        .where(
          and(
            eq(conferenceFamilyAssemblies.conferenceId, activeConference.id),
            inArray(conferenceFamilyAssemblies.familyId, familyIds),
          ),
        )
        .orderBy(asc(assemblies.name))
    : [];
  const activeAssemblies = await db
    .select({ id: assemblies.id, name: assemblies.name })
    .from(assemblies)
    .where(eq(assemblies.active, true))
    .orderBy(asc(assemblies.name));
  const assignedByFamily = new Map<string, Set<string>>();
  const assignedAssembliesByFamily = new Map<string, AssemblyOption[]>();

  for (const assignment of assignments) {
    const assigned = assignedByFamily.get(assignment.familyId) ?? new Set();
    assigned.add(assignment.assemblyId);
    assignedByFamily.set(assignment.familyId, assigned);

    const assignedAssemblies =
      assignedAssembliesByFamily.get(assignment.familyId) ?? [];
    assignedAssemblies.push({
      id: assignment.assemblyId,
      name: assignment.name,
    });
    assignedAssembliesByFamily.set(assignment.familyId, assignedAssemblies);
  }

  const availableByFamily = Object.fromEntries(
    familyIds.map((familyId) => [
      familyId,
      activeAssemblies.filter(
        (assembly) => !assignedByFamily.get(familyId)?.has(assembly.id),
      ),
    ]),
  );
  const assignedOptionsByFamily = Object.fromEntries(
    familyIds.map((familyId) => [
      familyId,
      assignedAssembliesByFamily.get(familyId) ?? [],
    ]),
  );

  return {
    conferenceAvailable: true,
    activeAssemblyCount: activeAssemblies.length,
    availableByFamily,
    assignedByFamily: assignedOptionsByFamily,
  };
}

export class FamilyAssignmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FamilyAssignmentError";
  }
}

export async function setAssembliesForFamily(
  familyId: string,
  assemblyIds: string[],
) {
  if (new Set(assemblyIds).size !== assemblyIds.length) {
    throw new FamilyAssignmentError("Remove duplicate assemblies.");
  }

  const db = getDb();
  return db.transaction(async (tx) => {
    const activeConference = await tx.query.conference.findFirst({
      where: eq(conference.isActive, true),
      columns: { id: true },
    });
    if (!activeConference) {
      throw new FamilyAssignmentError("No active conference is configured.");
    }

    const family = await tx.query.conferenceFamilies.findFirst({
      where: eq(conferenceFamilies.id, familyId),
      columns: { id: true },
    });
    if (!family) {
      throw new FamilyAssignmentError("The selected family was not found.");
    }

    const currentAssignments = await tx
      .select({ assemblyId: conferenceFamilyAssemblies.assemblyId })
      .from(conferenceFamilyAssemblies)
      .where(
        and(
          eq(conferenceFamilyAssemblies.conferenceId, activeConference.id),
          eq(conferenceFamilyAssemblies.familyId, familyId),
        ),
      );
    const currentIds = new Set(
      currentAssignments.map((assignment) => assignment.assemblyId),
    );
    const desiredIds = new Set(assemblyIds);
    const additions = assemblyIds.filter(
      (assemblyId) => !currentIds.has(assemblyId),
    );
    const removals = [...currentIds].filter(
      (assemblyId) => !desiredIds.has(assemblyId),
    );

    if (additions.length) {
      const activeAssemblies = await tx
        .select({ id: assemblies.id })
        .from(assemblies)
        .where(
          and(
            inArray(assemblies.id, additions),
            eq(assemblies.active, true),
          ),
        );
      if (activeAssemblies.length !== additions.length) {
        throw new FamilyAssignmentError(
          "One or more selected assemblies are unavailable.",
        );
      }

      const insertedAssignments = await tx
        .insert(conferenceFamilyAssemblies)
        .values(
          additions.map((assemblyId) => ({
            conferenceId: activeConference.id,
            familyId,
            assemblyId,
          })),
        )
        .onConflictDoNothing()
        .returning({ id: conferenceFamilyAssemblies.id });
      if (insertedAssignments.length !== additions.length) {
        throw new FamilyAssignmentError(
          "One or more selected assemblies are already assigned to this family.",
        );
      }
    }

    if (removals.length) {
      await tx
        .delete(conferenceFamilyAssemblies)
        .where(
          and(
            eq(conferenceFamilyAssemblies.conferenceId, activeConference.id),
            eq(conferenceFamilyAssemblies.familyId, familyId),
            inArray(conferenceFamilyAssemblies.assemblyId, removals),
          ),
        );
    }

    return { added: additions.length, removed: removals.length };
  });
}
