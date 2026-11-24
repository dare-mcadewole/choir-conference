import { getDb } from "@/db";
import { conference } from "@/features/conference/schema";
import { conferenceFamilies } from "@/features/family/schema";
import { academicLevels } from "@/features/institution/schema";
import {
  positionOptions,
  registrationCategories,
} from "@/features/registration/schema";
import { ticketTypes } from "@/features/ticket/schema";

export async function seedDefaults() {
  const db = getDb();
  await db
    .insert(conference)
    .values({
      title: "All Choirs' Conference 2027",
      theme: "The Able Minister",
      anchorScripture: "II CORINTHIANS 3:6",
      eventStartDate: new Date("2027-01-08"),
      eventEndDate: new Date("2027-01-09"),
      opensAt: new Date("2026-11-24"),
      closesAt: new Date("2026-12-11"),
      venue: "14, Holy Saviour's College Rd., Isolo, Lagos.",
    })
    .onConflictDoNothing();
  await db
    .insert(conferenceFamilies)
    .values([
      {
        name: "HARMONIA",
        slug: "harmonia",
        icon: "Music2",
        description: "A family joined in harmony.",
      },
      {
        name: "CONCORDIA",
        slug: "concordia",
        icon: "Users",
        description: "A family shaped by fellowship.",
      },
      {
        name: "SYMPHONY",
        slug: "symphony",
        icon: "AudioLines",
        description: "A family moving with one sound.",
      },
      {
        name: "MELODIA",
        slug: "melodia",
        icon: "Music",
        description: "A family carrying a distinct song.",
      },
    ])
    .onConflictDoNothing();
  await db
    .insert(registrationCategories)
    .values(
      [
        "Student",
        "Employed",
        "Self-employed",
        "Unemployed",
        "Entrepreneur",
        "Other",
      ].map((name, sortOrder) => ({
        name,
        slug: name.toLowerCase().replace(/\W+/g, "-"),
        sortOrder,
      })),
    )
    .onConflictDoNothing();
  await db
    .insert(positionOptions)
    .values(
      [
        "Choir Master",
        "Choir Coordinator",
        "Choir Executive",
        "Central Choir Executive",
      ].map((name, sortOrder) => ({ name, sortOrder })),
    )
    .onConflictDoNothing();
  await db
    .insert(ticketTypes)
    .values([
      { name: "Student", slug: "student", price: "7500" },
      { name: "Non-student", slug: "non-student", price: "10000" },
    ])
    .onConflictDoNothing();
  await db
    .insert(academicLevels)
    .values([
      ...["JSS 1", "JSS 2", "JSS 3", "SS1", "SS2", "SS3"].map(
        (name, sortOrder) => ({
          name,
          institutionType: "SECONDARY" as const,
          sortOrder,
        }),
      ),
      ...[
        "100 Level",
        "200 Level",
        "300 Level",
        "400 Level",
        "500 Level",
        "600 Level",
      ].map((name, sortOrder) => ({
        name,
        institutionType: "TERTIARY" as const,
        sortOrder,
      })),
    ])
    .onConflictDoNothing();
}
