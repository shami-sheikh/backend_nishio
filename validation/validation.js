import { z } from "zod";

export const signupSchema = z.object({
  userName: z
    .string({ required_error: "Username is required" })
    .trim()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(20, { message: "Username must not exceed 20 characters" })
    .regex(/^[a-zA-Z0-9_. ]+$/, {
      message: "Only letters, numbers, spaces, underscores, and periods allowed",
    }),

  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address" }),

  password: z
    .string({ required_error: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters" })
    .max(100, { message: "Password must not exceed 100 characters" }),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address" }),

  password: z.string({ required_error: "Password is required" }),
});