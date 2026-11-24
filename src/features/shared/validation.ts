import z from "zod";

export const PhoneSchema = z
  .string()
  .min(9, "Enter a valid phone number")
  .max(11)
  .regex(/^\d+$/, "Phone number must contain only digits");
