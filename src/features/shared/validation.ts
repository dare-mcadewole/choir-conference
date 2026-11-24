import z from "zod";

export const PhoneSchema = z
  .string()
  .trim()
  .min(9, "Enter a valid phone number")
  .max(11)
  .regex(/^\d+$/, "Phone number must contain only digits");
