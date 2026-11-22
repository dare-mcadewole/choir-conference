import { z } from "zod";

export const registrationSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(200),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(50),
  gender: z.enum(["MALE", "FEMALE"]),
  assemblyId: z.string().uuid("Choose your assembly"),
  categoryId: z.string().uuid("Choose a category"),
  positionIds: z.array(z.string().uuid()).default([]),
  centralChoirMember: z.boolean(),
  institutionId: z.string().uuid().optional(),
  academicLevelId: z.string().uuid().optional()
}).superRefine((data, ctx) => {
  if (data.categoryId === "student") return; // resolved to slug in service where DB data is authoritative
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
