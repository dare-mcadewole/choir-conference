import { asc, eq, ilike, or } from "drizzle-orm";
import { getDb } from "@/db";
import { assemblies } from "@/features/assembly/schema";
import { slugifyName } from "@/features/shared/utils/slug";

export async function find(search?: string) {
  const db = getDb();
  const query = search?.trim();

  return db
    .select({
      id: assemblies.id,
      name: assemblies.name,
      slug: assemblies.slug,
      active: assemblies.active,
    })
    .from(assemblies)
    .where(
      query
        ? or(
            ilike(assemblies.name, `%${query}%`),
            ilike(assemblies.slug, `%${query}%`),
          )
        : undefined,
    )
    .orderBy(asc(assemblies.name));
}

export type AssemblySummary = Awaited<ReturnType<typeof find>>[number];

export class AssemblyCreateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssemblyCreateError";
  }
}

export async function create(name: string) {
  const slug = slugifyName(name, 180);
  if (!slug) {
    throw new AssemblyCreateError(
      "Enter an assembly name containing letters or numbers.",
    );
  }

  const db = getDb();
  const [existing] = await db
    .select({ id: assemblies.id })
    .from(assemblies)
    .where(eq(assemblies.slug, slug))
    .limit(1);
  if (existing) {
    throw new AssemblyCreateError(
      "An assembly with this name already exists.",
    );
  }

  const [assembly] = await db
    .insert(assemblies)
    .values({ name, slug })
    .onConflictDoNothing()
    .returning({
      id: assemblies.id,
      name: assemblies.name,
      slug: assemblies.slug,
      active: assemblies.active,
    });
  if (!assembly) {
    throw new AssemblyCreateError(
      "An assembly with this name already exists.",
    );
  }
  return assembly;
}
