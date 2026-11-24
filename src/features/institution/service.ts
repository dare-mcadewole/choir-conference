import { tertiaryInstitutions } from "@/features/institution/data";

export async function find() {
  return Promise.resolve(tertiaryInstitutions);
}
