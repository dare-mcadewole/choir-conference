import { count, desc, eq, ilike, or, sql, sum } from "drizzle-orm";
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import { getDb } from "@/db";
import { assemblies } from "@/features/assembly/schema";
import { conference } from "@/features/conference/schema";
import {
  conferenceFamilies,
  conferenceFamilyAssemblies,
} from "@/features/family/schema";
import { payments } from "@/features/payment/schema";
import {
  registrationCategories,
  registrations,
} from "@/features/registration/schema";

const AGE_RANGES = [
  "15 - 20",
  "21 - 29",
  "30 - 39",
  "40 - 49",
  "50 and above",
] as const;

function buildRegistrationTrend(
  rows: Array<{ date: string; total: number | string }>,
  opensAt: Date | null,
) {
  if (!rows.length) return [];

  const counts = new Map(rows.map((row) => [row.date, Number(row.total)]));
  const first = startOfDay(parseISO(rows[0].date));
  const last = startOfDay(parseISO(rows[rows.length - 1].date));
  const today = startOfDay(new Date());
  const end = last > today ? last : today;
  const configuredStart = opensAt ? startOfDay(opensAt) : first;
  const start = configuredStart < first ? configuredStart : first;
  const cappedStart =
    differenceInCalendarDays(end, start) > 90 ? subDays(end, 90) : start;

  if (cappedStart > end) return [];

  return eachDayOfInterval({ start: cappedStart, end }).map((day) => {
    const date = format(day, "yyyy-MM-dd");
    return {
      date,
      label: format(day, "MMM d"),
      total: counts.get(date) ?? 0,
    };
  });
}

function buildAgeDistribution(
  rows: Array<{ range: string; total: number | string }>,
) {
  const counts = new Map(rows.map((row) => [row.range, Number(row.total)]));
  const known = new Set<string>(AGE_RANGES);
  const distribution = AGE_RANGES.map((range) => ({
    range,
    total: counts.get(range) ?? 0,
  }));
  const extras = rows
    .filter((row) => !known.has(row.range))
    .map((row) => ({
      range: row.range.trim() || "Not provided",
      total: Number(row.total),
    }))
    .sort((a, b) => b.total - a.total);

  return [...distribution, ...extras];
}

function buildGenderRatio(
  rows: Array<{ gender: "MALE" | "FEMALE"; total: number | string }>,
) {
  const counts = new Map(rows.map((row) => [row.gender, Number(row.total)]));

  return [
    {
      key: "MALE" as const,
      label: "Male",
      total: counts.get("MALE") ?? 0,
    },
    {
      key: "FEMALE" as const,
      label: "Female",
      total: counts.get("FEMALE") ?? 0,
    },
  ];
}

export async function findStatistics() {
  const db = getDb();
  const [total] = await db
    .select({ total: count() })
    .from(registrations)
    .where(eq(registrations.status, "CONFIRMED"));
  const [totalRegistrations] = await db
    .select({ total: count() })
    .from(registrations);
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
  const [trendRows, ageRows, genderRows, conferenceRows] = await Promise.all([
    db
      .select({
        date: sql<string>`to_char(date_trunc('day', ${registrations.createdAt}), 'YYYY-MM-DD')`,
        total: count(),
      })
      .from(registrations)
      .groupBy(sql`date_trunc('day', ${registrations.createdAt})`)
      .orderBy(sql`date_trunc('day', ${registrations.createdAt})`),
    db
      .select({
        range: registrations.ageRange,
        total: count(),
      })
      .from(registrations)
      .groupBy(registrations.ageRange),
    db
      .select({
        gender: registrations.gender,
        total: count(),
      })
      .from(registrations)
      .groupBy(registrations.gender),
    db.select({ opensAt: conference.opensAt }).from(conference).limit(1),
  ]);
  return {
    total: Number(total?.total ?? 0),
    totalRegistrations: Number(totalRegistrations?.total ?? 0),
    registrationTrend: buildRegistrationTrend(
      trendRows,
      conferenceRows[0]?.opensAt ?? null,
    ),
    ageDistribution: buildAgeDistribution(ageRows),
    genderRatio: buildGenderRatio(genderRows),
    families,
    leaderboard,
    categories,
  };
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
