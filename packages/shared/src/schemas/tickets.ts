import { z } from "zod";

export const ticketStatusEnum = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "WAITING_CUSTOMER",
  "RESOLVED",
  "CANCELLED",
]);

export const ticketPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const ticketCategoryEnum = z.enum([
  "SISTEMA",
  "FINANCEIRO",
  "ACESSO",
  "BUG",
  "SOLICITACAO",
  "INTEGRACAO",
  "NOTA_FISCAL",
  "OUTRO",
]);

export const ticketSchema = z.object({
  id: z.string(),
  protocol: z.string(),
  title: z.string(),
  description: z.string(),
  status: ticketStatusEnum,
  priority: ticketPriorityEnum,
  category: ticketCategoryEnum,
  customerId: z.string(),
  assigneeId: z.string().nullable(),
  slaDueAt: z.string(),
  resolvedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  customer: z
    .object({
      id: z.string(),
      name: z.string(),
      company: z.string().nullable(),
      email: z.string(),
    })
    .optional(),
  assignee: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })
    .nullable()
    .optional(),
});
export type Ticket = z.infer<typeof ticketSchema>;

export const createTicketInputSchema = z.object({
  title: z.string().min(3, "Título muito curto").max(180),
  description: z.string().min(10, "Descreva o problema com mais detalhes"),
  priority: ticketPriorityEnum.default("MEDIUM"),
  category: ticketCategoryEnum.default("OUTRO"),
  // Optional in the schema: staff must supply it; for CUSTOMER role the API
  // infers it from the authenticated user.
  customerId: z.string().optional(),
});
export type CreateTicketInput = z.infer<typeof createTicketInputSchema>;

export const updateTicketStatusSchema = z.object({
  status: ticketStatusEnum,
});
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;

export const updateTicketPrioritySchema = z.object({
  priority: ticketPriorityEnum,
});
export type UpdateTicketPriorityInput = z.infer<typeof updateTicketPrioritySchema>;

export const assignTicketSchema = z.object({
  assigneeId: z.string().nullable(),
});
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;

export const listTicketsQuerySchema = z.object({
  search: z.string().optional(),
  status: ticketStatusEnum.optional(),
  priority: ticketPriorityEnum.optional(),
  category: ticketCategoryEnum.optional(),
  customerId: z.string().optional(),
  assigneeId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;

export const ticketEventSchema = z.object({
  id: z.string(),
  ticketId: z.string(),
  type: z.enum([
    "CREATED",
    "STATUS_CHANGED",
    "PRIORITY_CHANGED",
    "ASSIGNED",
    "MESSAGE_SENT",
    "RESOLVED",
    "REOPENED",
    "CANCELLED",
  ]),
  payload: z.record(z.any()).nullable(),
  authorId: z.string().nullable(),
  authorName: z.string().nullable(),
  createdAt: z.string(),
});
export type TicketEvent = z.infer<typeof ticketEventSchema>;
