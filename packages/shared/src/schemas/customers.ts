import { z } from "zod";

export const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  company: z.string().nullable(),
  email: z.string().email(),
  phone: z.string().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Customer = z.infer<typeof customerSchema>;

export const createCustomerInputSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  company: z.string().optional().nullable(),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});
export type CreateCustomerInput = z.infer<typeof createCustomerInputSchema>;

export const updateCustomerInputSchema = createCustomerInputSchema.partial();
export type UpdateCustomerInput = z.infer<typeof updateCustomerInputSchema>;

export const listCustomersQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
export type ListCustomersQuery = z.infer<typeof listCustomersQuerySchema>;
