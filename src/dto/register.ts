import * as z from "zod";

export const registerSchema = z
  .object({
    email: z
      .string({ error: "email is required" })
      .email("Invalid email"),
      name: z.string({error: "name is required"}),
    password: z
      .string({ error: "password is required" })
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string({
      error: "confirmPassword is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  }).strict();

export type RegisterDTO = z.infer<typeof registerSchema>;
