import { and, asc, desc, eq, ilike, inArray, not, or } from "drizzle-orm";
import { getDb } from "@/db";
import { assemblies } from "@/features/assembly/schema";
import { conference } from "@/features/conference/schema";
import {
  conferenceFamilies,
  conferenceFamilyAssemblies,
} from "@/features/family/schema";
import { academicLevels } from "@/features/institution/schema";
import {
  Gender,
  historicalRegistrants,
  positionOptions,
  registrationCategories,
  registrationPositions,
  registrations,
  type VocalPart,
} from "@/features/registration/schema";
import { ticketTypes, tickets } from "@/features/ticket/schema";
import { normalizeEmail, normalizePhone } from "@/lib/utils";
import * as paymentService from "@/features/payment/service";
import type { RegistrationInput } from "./validation";
import * as institutionService from "@/features/institution/service";
import {
  generateRegistrationCode,
  generateToken,
} from "@/features/registration/utils";
import { HistoricalJsonData } from "@/features/ticket/types";

export async function lookupRegistrant(query: string) {
  const db = getDb();
  const email = query.includes("@") ? normalizeEmail(query) : null;
  const phone = email ? null : normalizePhone(query);
  const current = await db.query.registrations.findFirst({
    where: or(
      email ? eq(registrations.email, email) : undefined,
      phone ? eq(registrations.phone, phone) : undefined,
    ),
  });
  if (current) return { state: "registered" as const };
  const prior = await db.query.historicalRegistrants.findFirst({
    where: or(
      email ? eq(historicalRegistrants.email, email) : undefined,
      phone ? eq(historicalRegistrants.phone, phone) : undefined,
    ),
  });

  return prior
    ? {
        state: "historical" as const,
        data: {
          fullName: prior.fullName,
          email: prior.email ?? "",
          phone: prior.phone ?? "",
          data: (prior.data ?? {}) as HistoricalJsonData,
        },
      }
    : { state: "new" as const };
}

export async function findAdminRegistrations(search?: string) {
  const db = getDb();
  const query = search?.trim();
  const rows = await db
    .select({
      id: registrations.id,
      fullName: registrations.fullName,
      email: registrations.email,
      phone: registrations.phone,
      gender: registrations.gender,
      assemblyId: registrations.assemblyId,
      assemblyName: assemblies.name,
      categoryId: registrations.categoryId,
      categoryName: registrationCategories.name,
      categorySlug: registrationCategories.slug,
      part: registrations.part,
      centralChoirMember: registrations.centralChoirMember,
      institution: registrations.institution,
      academicLevelId: registrations.academicLevelId,
      academicLevelName: academicLevels.name,
      status: registrations.status,
      registrationCode: registrations.registrationCode,
      createdAt: registrations.createdAt,
    })
    .from(registrations)
    .leftJoin(assemblies, eq(registrations.assemblyId, assemblies.id))
    .leftJoin(
      registrationCategories,
      eq(registrations.categoryId, registrationCategories.id),
    )
    .leftJoin(
      academicLevels,
      eq(registrations.academicLevelId, academicLevels.id),
    )
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
    .orderBy(desc(registrations.createdAt));

  const positionRows = rows.length
    ? await db
        .select({
          registrationId: registrationPositions.registrationId,
          id: positionOptions.id,
          name: positionOptions.name,
        })
        .from(registrationPositions)
        .innerJoin(
          positionOptions,
          eq(registrationPositions.positionId, positionOptions.id),
        )
        .where(
          inArray(
            registrationPositions.registrationId,
            rows.map((registration) => registration.id),
          ),
        )
        .orderBy(asc(positionOptions.name))
    : [];
  const positionsByRegistration = new Map<
    string,
    Array<{ id: string; name: string }>
  >();

  for (const position of positionRows) {
    const positions =
      positionsByRegistration.get(position.registrationId) ?? [];
    positions.push({ id: position.id, name: position.name });
    positionsByRegistration.set(position.registrationId, positions);
  }

  return rows.map((registration) => ({
    ...registration,
    positions: positionsByRegistration.get(registration.id) ?? [],
  }));
}

export type AdminRegistrationSummary = Awaited<
  ReturnType<typeof findAdminRegistrations>
>[number];

export async function findAdminRegistrationOptions() {
  const db = getDb();
  const [assemblyOptions, categories, positions, levels, institutions] =
    await Promise.all([
      db
        .select({
          id: assemblies.id,
          name: assemblies.name,
          active: assemblies.active,
        })
        .from(assemblies)
        .orderBy(asc(assemblies.name)),
      db
        .select({
          id: registrationCategories.id,
          name: registrationCategories.name,
          slug: registrationCategories.slug,
          active: registrationCategories.active,
        })
        .from(registrationCategories)
        .orderBy(asc(registrationCategories.sortOrder)),
      db
        .select({
          id: positionOptions.id,
          name: positionOptions.name,
          active: positionOptions.active,
        })
        .from(positionOptions)
        .orderBy(asc(positionOptions.sortOrder)),
      db
        .select({
          id: academicLevels.id,
          name: academicLevels.name,
          active: academicLevels.active,
        })
        .from(academicLevels)
        .orderBy(asc(academicLevels.sortOrder)),
      institutionService.find(),
    ]);

  return {
    assemblies: assemblyOptions,
    categories,
    positions,
    levels,
    institutions,
  };
}

export type AdminRegistrationOptions = Awaited<
  ReturnType<typeof findAdminRegistrationOptions>
>;

export type AdminRegistrationUpdate = {
  fullName: string;
  email: string;
  phone: string;
  gender: "MALE" | "FEMALE";
  assemblyId: string;
  categoryId: string;
  part: VocalPart;
  centralChoirMember: boolean;
  institution: string | null;
  academicLevelId: string | null;
  positionIds: string[];
};

export class RegistrationUpdateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RegistrationUpdateError";
  }
}

export async function updateAdminRegistration(
  registrationId: string,
  details: AdminRegistrationUpdate,
) {
  if (new Set(details.positionIds).size !== details.positionIds.length) {
    throw new RegistrationUpdateError("Remove duplicate positions.");
  }

  const db = getDb();
  return db.transaction(async (tx) => {
    const registration = await tx.query.registrations.findFirst({
      where: eq(registrations.id, registrationId),
      columns: { id: true },
    });
    if (!registration) {
      throw new RegistrationUpdateError("Registration was not found.");
    }

    const category = await tx.query.registrationCategories.findFirst({
      where: eq(registrationCategories.id, details.categoryId),
      columns: { slug: true },
    });
    if (!category) {
      throw new RegistrationUpdateError(
        "The selected category is unavailable.",
      );
    }

    const assembly = await tx.query.assemblies.findFirst({
      where: eq(assemblies.id, details.assemblyId),
      columns: { id: true },
    });
    if (!assembly) {
      throw new RegistrationUpdateError(
        "The selected assembly is unavailable.",
      );
    }

    const isStudent = category.slug === "student";
    if (isStudent && (!details.institution || !details.academicLevelId)) {
      throw new RegistrationUpdateError(
        "Institution and academic level are required for student registrations.",
      );
    }
    if (isStudent && details.academicLevelId) {
      const level = await tx.query.academicLevels.findFirst({
        where: eq(academicLevels.id, details.academicLevelId),
        columns: { id: true },
      });
      if (!level) {
        throw new RegistrationUpdateError(
          "The selected academic level is unavailable.",
        );
      }
    }

    if (details.positionIds.length) {
      const existingPositions = await tx
        .select({ id: positionOptions.id })
        .from(positionOptions)
        .where(inArray(positionOptions.id, details.positionIds));
      if (existingPositions.length !== details.positionIds.length) {
        throw new RegistrationUpdateError(
          "One or more selected positions are unavailable.",
        );
      }
    }

    await tx
      .update(registrations)
      .set({
        fullName: details.fullName,
        email: normalizeEmail(details.email),
        phone: normalizePhone(details.phone),
        gender: details.gender,
        assemblyId: details.assemblyId,
        categoryId: details.categoryId,
        part: details.part,
        centralChoirMember: details.centralChoirMember,
        institution: isStudent ? details.institution : null,
        academicLevelId: isStudent ? details.academicLevelId : null,
        updatedAt: new Date(),
      })
      .where(eq(registrations.id, registrationId));

    const currentPositions = await tx
      .select({ positionId: registrationPositions.positionId })
      .from(registrationPositions)
      .where(eq(registrationPositions.registrationId, registrationId));
    const currentPositionIds = new Set(
      currentPositions.map((position) => position.positionId),
    );
    const desiredPositionIds = new Set(details.positionIds);
    const positionsToAdd = details.positionIds.filter(
      (positionId) => !currentPositionIds.has(positionId),
    );
    const positionsToRemove = [...currentPositionIds].filter(
      (positionId) => !desiredPositionIds.has(positionId),
    );

    if (positionsToRemove.length) {
      await tx
        .delete(registrationPositions)
        .where(
          and(
            eq(registrationPositions.registrationId, registrationId),
            inArray(registrationPositions.positionId, positionsToRemove),
          ),
        );
    }
    if (positionsToAdd.length) {
      await tx
        .insert(registrationPositions)
        .values(
          positionsToAdd.map((positionId) => ({
            registrationId,
            positionId,
          })),
        )
        .onConflictDoNothing();
    }
  });
}

export async function createRegistration(input: RegistrationInput) {
  const db = getDb();
  const settings = await db.query.conference.findFirst();
  if (!settings?.registrationOpen) {
    throw new Error("Registration is currently closed.");
  }

  const category = await db.query.registrationCategories.findFirst({
    where: and(
      eq(registrationCategories.id, input.categoryId),
      eq(registrationCategories.active, true),
    ),
  });
  if (!category) throw new Error("The selected category is unavailable.");

  if (
    category.slug === "student" &&
    (!input.institution || !input.academicLevelId)
  )
    throw new Error(
      "Institution and academic level are required for student registrations.",
    );
  if (category.slug === "student") {
    const level = await db.query.academicLevels.findFirst({
      where: eq(academicLevels.id, input.academicLevelId!),
    });
    if (!level) throw new Error("Choose an academic level");
  }
  const normalizedEmail = normalizeEmail(input.email),
    normalizedPhone = normalizePhone(input.phone);
  if (!settings.allowDuplicates) {
    const duplicate = await db.query.registrations.findFirst({
      where: or(
        eq(registrations.email, normalizedEmail),
        eq(registrations.phone, normalizedPhone),
      ),
    });
    if (duplicate)
      throw new Error(
        "An existing registration was found. Please use your confirmation link or contact support.",
      );
  }

  const ticketType = await db.query.ticketTypes.findFirst({
    where: eq(
      ticketTypes.slug,
      category.slug === "student" ? "student" : "non-student",
    ),
  });
  if (!ticketType?.active)
    throw new Error("The required ticket type is unavailable.");

  const confirmed = !settings.requirePayment;
  const registrationCode = confirmed
    ? generateRegistrationCode(input.fullName)
    : null;
  const ticketToken = confirmed ? generateToken() : null;
  const [ticketDetails] = await db
    .select({
      assembly: assemblies.name,
      family: conferenceFamilies.name,
    })
    .from(assemblies)
    .innerJoin(
      conferenceFamilyAssemblies,
      eq(assemblies.id, conferenceFamilyAssemblies.assemblyId),
    )
    .innerJoin(
      conference,
      and(
        eq(conference.id, conferenceFamilyAssemblies.conferenceId),
        eq(conference.isActive, true),
      ),
    )
    .leftJoin(
      conferenceFamilies,
      eq(conferenceFamilyAssemblies.familyId, conferenceFamilies.id),
    )
    .where(
      and(eq(assemblies.id, input.assemblyId), eq(assemblies.active, true)),
    )
    .limit(1);
  if (!ticketDetails) {
    throw new Error(
      "The selected assembly is not assigned to a family for the active conference.",
    );
  }

  const [registration] = await db
    .insert(registrations)
    .values({
      fullName: input.fullName,
      email: normalizedEmail,
      phone: normalizedPhone,
      gender: input.gender as Gender,
      ageRange: input.ageRange,
      assemblyId: input.assemblyId,
      categoryId: input.categoryId,
      part: input.part,
      centralChoirMember: input.centralChoirMember,
      institution: category.slug === "student" ? input.institution : null,
      academicLevelId:
        category.slug === "student" ? input.academicLevelId : null,
      status: confirmed ? "CONFIRMED" : "PENDING_PAYMENT",
      registrationCode,
      ticketToken,
      confirmedAt: confirmed ? new Date() : null,
    })
    .returning();
  if (!registration) throw new Error("We could not create your registration.");
  if (input.positionIds.length)
    await db
      .insert(registrationPositions)
      .values(
        input.positionIds.map((positionId) => ({
          registrationId: registration.id,
          positionId,
        })),
      )
      .onConflictDoNothing();
  if (confirmed && ticketToken)
    await db
      .insert(tickets)
      .values({ registrationId: registration.id, token: ticketToken });
  const checkoutUrl = settings.requirePayment
    ? await paymentService.initializePaystackCheckout({
        email: input.email,
        amount: Number(ticketType.price),
        registrationId: registration.id,
      })
    : undefined;
  return {
    code: registrationCode,
    requiresPayment: settings.requirePayment,
    ticketPrice: ticketType.price,
    checkoutUrl,
    ticket:
      ticketToken && registrationCode && ticketDetails
        ? {
            fullName: registration.fullName,
            code: registrationCode,
            assembly: ticketDetails.assembly,
            family: ticketDetails.family,
            token: ticketToken,
          }
        : null,
  };
}

export async function publicRegistrationOptions() {
  const db = getDb();
  const [assembliesData, categories, positions, institutionsData, levels] =
    await Promise.all([
      db
        .selectDistinct({
          id: assemblies.id,
          name: assemblies.name,
        })
        .from(assemblies)
        .innerJoin(
          conferenceFamilyAssemblies,
          eq(assemblies.id, conferenceFamilyAssemblies.assemblyId),
        )
        .innerJoin(
          conference,
          and(
            eq(conference.id, conferenceFamilyAssemblies.conferenceId),
            eq(conference.isActive, true),
          ),
        )
        .where(eq(assemblies.active, true))
        .orderBy(asc(assemblies.name)),
      db
        .select()
        .from(registrationCategories)
        .where(eq(registrationCategories.active, true)),
      db.select().from(positionOptions).where(eq(positionOptions.active, true)),
      institutionService.find(),
      db.select().from(academicLevels).where(eq(academicLevels.active, true)),
    ]);
  return {
    assemblies: assembliesData,
    categories,
    positions,
    institutions: institutionsData,
    levels,
  };
}

export async function findConfirmationByCode(code: string) {
  const db = getDb();
  const row = await db
    .select({
      fullName: registrations.fullName,
      status: registrations.status,
      registrationCode: registrations.registrationCode,
      ticketToken: registrations.ticketToken,
      ticketStatus: tickets.status,
      assembly: assemblies.name,
      family: conferenceFamilies.name,
      whatsappUrl: conferenceFamilies.whatsappUrl,
    })
    .from(registrations)
    .leftJoin(tickets, eq(tickets.registrationId, registrations.id))
    .leftJoin(assemblies, eq(registrations.assemblyId, assemblies.id))
    .leftJoin(
      conferenceFamilyAssemblies,
      eq(assemblies.id, conferenceFamilyAssemblies.assemblyId),
    )
    .leftJoin(
      conferenceFamilies,
      eq(conferenceFamilyAssemblies.familyId, conferenceFamilies.id),
    )
    .where(
      and(
        eq(registrations.registrationCode, code),
        not(eq(registrations.status, "CANCELLED")),
      ),
    )
    .limit(1);
  return row[0] ?? null;
}
