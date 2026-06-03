import { z } from "zod";

export const completeProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name is required"),

  dateOfBirth: z.date({
    required_error: "Date of birth is required",
    invalid_type_error: "Invalid date format",
  }),

  sport: z.enum(["CRICKET", "FOOTBALL"]),

  level: z.enum([
    "DISTRICT",
    "STATE",
    "NATIONAL",
  ]),

  address: z
    .string()
    .min(5, "Address is required"),

  bio: z
    .string()
    .max(300)
    .optional(),
});