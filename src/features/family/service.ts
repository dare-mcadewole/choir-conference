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
    };
  }

  const assignments = familyIds.length
    ? await db
        .select({
          familyId: conferenceFamilyAssemblies.familyId,
          assemblyId: conferenceFamilyAssemblies.assemblyId,
        })
        .from(conferenceFamilyAssemblies)
        .where(
          and(
            eq(conferenceFamilyAssemblies.conferenceId, activeConference.id),
            inArray(conferenceFamilyAssemblies.familyId, familyIds),
          ),
        )
    : [];
  const activeAssemblies = await db
    .select({ id: assemblies.id, name: assemblies.name })
    .from(assemblies)
    .where(eq(assemblies.active, true))
    .orderBy(asc(assemblies.name));
  const assignedByFamily = new Map<string, Set<string>>();

  for (const assignment of assignments) {
    const assigned = assignedByFamily.get(assignment.familyId) ?? new Set();
    assigned.add(assignment.assemblyId);
    assignedByFamily.set(assignment.familyId, assigned);
  }

  const availableByFamily = Object.fromEntries(
    familyIds.map((familyId) => [
      familyId,
      activeAssemblies.filter(
        (assembly) => !assignedByFamily.get(familyId)?.has(assembly.id),
      ),
    ]),
  );

  return {
    conferenceAvailable: true,
    activeAssemblyCount: activeAssemblies.length,
    availableByFamily,
  };
}

export class FamilyAssignmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FamilyAssignmentError";
  }
}

export async function addAssemblyToFamily(
  familyId: string,
  assemblyId: string,
) {
  const db = getDb();
  await db.transaction(async (tx) => {
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

    const assembly = await tx.query.assemblies.findFirst({
      where: and(
        eq(assemblies.id, assemblyId),
        eq(assemblies.active, true),
      ),
      columns: { id: true },
    });
    if (!assembly) {
      throw new FamilyAssignmentError(
        "The selected assembly is unavailable.",
      );
    }

    const [assignment] = await tx
      .insert(conferenceFamilyAssemblies)
      .values({
        conferenceId: activeConference.id,
        familyId,
        assemblyId,
      })
      .onConflictDoNothing()
      .returning({ id: conferenceFamilyAssemblies.id });
    if (!assignment) {
      throw new FamilyAssignmentError(
        "This assembly is already assigned to this family.",
      );
    }
  });
}
