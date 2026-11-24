import { z } from "zod";

export const registrationSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(200),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(50),
  gender: z.enum(["MALE", "FEMALE"], {
    error: "Choose your gender",
  }),
  assemblyId: z.uuid("Choose your assembly"),
  categoryId: z.uuid("Choose a category"),
  positionIds: z.array(z.uuid()).default([]),
  centralChoirMember: z.boolean(),
  institutionId: z.uuid().optional(),
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

    if (!data.institutionId) {
      ctx.addIssue({
        code: "custom",
        message: "Choose an institution",
        path: ["institutionId"],
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
