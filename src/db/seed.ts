import * as dbService from "./service";

async function seed() {
  await dbService.seedDefaults();
  console.info(
    "Conference defaults seeded. Add assemblies and institutions from the admin dashboard.",
  );
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
