import { VOCAL_PART_OPTIONS } from "@/db/schema";
import { PhoneSchema } from "@/features/shared/validation";
import { z } from "zod";

export const registrationSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(200),
  email: z.string().trim().email("Enter a valid email address"),
  phone: PhoneSchema,
  gender: z.enum(["MALE", "FEMALE"], {
    error: "Choose gender",
  }),
  assemblyId: z.uuid("Choose your assembly"),
  categoryId: z.uuid("Choose a category"),
  positionIds: z.array(z.uuid()).default([]),
  part: z.enum(VOCAL_PART_OPTIONS, "Choose part"),
  centralChoirMember: z.boolean("Choose an option"),
  institution: z.string().optional(),
  academicLevelId: z.uuid().optional(),
});

export function createRegistrationFormSchema(
  categories: Array<{ id: string; slug?: string }>,
) {
  const studentCategoryIds = new Set(
    categories
      .filter((category) => category.slug === "student")
      .map(({ id }) => id),
  );

  return registrationSchema.superRefine((data, ctx) => {
    if (!studentCategoryIds.has(data.categoryId)) return;

    if (!data.institution) {
      ctx.addIssue({
        code: "custom",
        message: "Enter your institution",
        path: ["institution"],
      });
    }

    if (!data.academicLevelId) {
      ctx.addIssue({
        code: "custom",
        message: "Choose an academic level",
        path: ["academicLevelId"],
      });
    }
  });
}

export type RegistrationInput = z.infer<typeof registrationSchema>;
