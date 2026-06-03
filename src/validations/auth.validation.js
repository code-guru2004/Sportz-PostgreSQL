import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(15, "Username must be at most 15 characters"),

  email: z
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  role: z.enum(["ATHLETE", "COACH"]),
  phone: z.string()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number must be at most 15 digits")
        .optional(),
});

export const loginSchema = z.object({
  email: z.email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export const verifyEmailSchema = z.object({
  email: z.email("Invalid email address"),

    otp: z.string()
        .min(6, "OTP must be at least 6 characters")
        .max(6, "OTP must be at most 6 characters"),
});