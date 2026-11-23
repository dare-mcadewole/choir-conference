import { and, eq, or } from "drizzle-orm";
import { randomBytes } from "crypto";
import { getDb } from "@/db";
import {
  academicLevels,
  assemblies,
  conferenceFamilies,
  conferenceSettings,
  institutions,
  registrationCategories,
  registrationPositions,
  registrations,
  ticketTypes,
  tickets,
} from "@/db/schema";
import { normalizeEmail, normalizePhone } from "@/lib/utils";
import { initializePaystackCheckout } from "@/lib/payments";
import type { RegistrationInput } from "./validation";

const code = () => `ACC27-${randomBytes(4).toString("hex").toUpperCase()}`;
const token = () => randomBytes(32).toString("base64url");

export async function lookupRegistrant(query: string) {
  const db = getDb();
  const email = query.includes("@") ? normalizeEmail(query) : null;
  const phone = email ? null : normalizePhone(query);
  const current = await db.query.registrations.findFirst({
    where: or(
      email ? eq(registrations.normalizedEmail, email) : undefined,
      phone ? eq(registrations.normalizedPhone, phone) : undefined,
    ),
  });
  if (current) return { state: "registered" as const };
  const prior = await db.query.historicalRegistrants.findFirst({
    where: or(
      email
        ? eq(
            (await import("@/db/schema")).historicalRegistrants.normalizedEmail,
            email,
          )
        : undefined,
      phone
        ? eq(
            (await import("@/db/schema")).historicalRegistrants.normalizedPhone,
            phone,
          )
        : undefined,
    ),
  });
  return prior
    ? {
        state: "historical" as const,
        data: {
          fullName: prior.fullName,
          email: prior.email ?? "",
          phone: prior.phone ?? "",
        },
      }
    : { state: "new" as const };
}

export async function createRegistration(input: RegistrationInput) {
  const db = getDb();
  const settings = await db.query.conferenceSettings.findFirst();
  if (!settings?.registrationOpen)
    throw new Error("Registration is currently closed.");
  const assembly = await db.query.assemblies.findFirst({
    where: and(
      eq(assemblies.id, input.assemblyId),
      eq(assemblies.active, true),
    ),
  });
  if (!assembly?.familyId)
    throw new Error(
      "This assembly has not yet been assigned to a conference family.",
    );
  const category = await db.query.registrationCategories.findFirst({
    where: and(
      eq(registrationCategories.id, input.categoryId),
      eq(registrationCategories.active, true),
    ),
  });
  if (!category) throw new Error("The selected category is unavailable.");
  if (
    category.slug === "student" &&
    (!input.institutionId || !input.academicLevelId)
  )
    throw new Error(
      "Institution and academic level are required for student registrations.",
    );
  if (category.slug === "student") {
    const institution = await db.query.institutions.findFirst({
      where: and(
        eq(institutions.id, input.institutionId!),
        eq(institutions.active, true),
      ),
    });
    const level = await db.query.academicLevels.findFirst({
      where: eq(academicLevels.id, input.academicLevelId!),
    });
    if (!institution || !level || institution.type !== level.institutionType)
      throw new Error(
        "Choose an academic level that matches your institution.",
      );
  }
  const normalizedEmail = normalizeEmail(input.email),
    normalizedPhone = normalizePhone(input.phone);
  if (!settings.allowDuplicates) {
    const duplicate = await db.query.registrations.findFirst({
      where: or(
        eq(registrations.normalizedEmail, normalizedEmail),
        eq(registrations.normalizedPhone, normalizedPhone),
      ),
    });
    if (duplicate)
      throw new Error(
        "An existing registration was found. Please use your confirmation link or contact support.",
      );
  }
  const ticketType = await db.query.ticketTypes.findFirst({
    where: eq(
      ticketTypes.categorySlug,
      category.slug === "student" ? "student" : "non-student",
    ),
  });
  if (!ticketType?.active)
    throw new Error("The required ticket type is unavailable.");
  const confirmed = !settings.requirePayment;
  const registrationCode = confirmed ? code() : null;
  const ticketToken = confirmed ? token() : null;
  const [registration] = await db
    .insert(registrations)
    .values({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      gender: input.gender,
      assemblyId: input.assemblyId,
      categoryId: input.categoryId,
      centralChoirMember: input.centralChoirMember,
      normalizedEmail,
      normalizedPhone,
      familyId: assembly.familyId,
      institutionId: category.slug === "student" ? input.institutionId : null,
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
    ? await initializePaystackCheckout({
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
  };
}

export async function publicRegistrationOptions() {
  const db = getDb();
  const [assembliesData, categories, positions, institutionsData, levels] =
    await Promise.all([
      db
        .select({
          id: assemblies.id,
          name: assemblies.name,
          familyId: assemblies.familyId,
          familyName: conferenceFamilies.name,
        })
        .from(assemblies)
        .leftJoin(
          conferenceFamilies,
          eq(assemblies.familyId, conferenceFamilies.id),
        )
        .where(eq(assemblies.active, true)),
      db
        .select()
        .from(registrationCategories)
        .where(eq(registrationCategories.active, true)),
      db
        .select()
        .from((await import("@/db/schema")).positionOptions)
        .where(eq((await import("@/db/schema")).positionOptions.active, true)),
      db.select().from(institutions).where(eq(institutions.active, true)),
      db.select().from(academicLevels).where(eq(academicLevels.active, true)),
    ]);
  return {
    assemblies: assembliesData.filter((item) => item.familyId),
    categories,
    positions,
    institutions: institutionsData,
    levels,
  };
}
