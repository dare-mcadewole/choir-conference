import { getDb } from "./index";
import {
  academicLevels,
  conferenceFamilies,
  conferenceSettings,
  positionOptions,
  registrationCategories,
  ticketTypes,
} from "./schema";

async function seed() {
  const db = getDb();
  await db.insert(conferenceSettings).values({}).onConflictDoNothing();
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
      ["Student", "Worker", "Self-employed", "Other"].map(
        (name, sortOrder) => ({
          name,
          slug: name.toLowerCase().replace(/\W+/g, "-"),
          sortOrder,
        }),
      ),
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
      { name: "Student", categorySlug: "student", price: "7500" },
      { name: "Non-student", categorySlug: "non-student", price: "10000" },
    ])
    .onConflictDoNothing();
  await db
    .insert(academicLevels)
    .values([
      ...["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"].map(
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
        "Other",
      ].map((name, sortOrder) => ({
        name,
        institutionType: "TERTIARY" as const,
        sortOrder,
      })),
    ])
    .onConflictDoNothing();
  console.info(
    "Conference defaults seeded. Add assemblies and institutions from the admin dashboard.",
  );
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
