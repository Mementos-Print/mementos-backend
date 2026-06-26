import * as z from "zod";

export const loginSchema = z
  .object({
    email: z
      .string({ error: "email is required" })
      .email("Invalid email"),
    password: z
      .string({ error: "password is required" })
  }).strict();

export type RegisterDTO = z.infer<typeof loginSchema>;
