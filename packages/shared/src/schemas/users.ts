import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["ADMIN", "AGENT", "CUSTOMER"]),
  createdAt: z.string(),
});
export type User = z.infer<typeof userSchema>;

export const createUserInputSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  role: z.enum(["ADMIN", "AGENT", "CUSTOMER"]).default("AGENT"),
});
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
