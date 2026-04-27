import { z } from "zod";

export const ticketMessageSchema = z.object({
  id: z.string(),
  ticketId: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  authorRole: z.enum(["ADMIN", "AGENT", "CUSTOMER"]),
  content: z.string(),
  createdAt: z.string(),
});
export type TicketMessage = z.infer<typeof ticketMessageSchema>;

export const createTicketMessageInputSchema = z.object({
  content: z.string().min(1, "A mensagem não pode estar vazia"),
});
export type CreateTicketMessageInput = z.infer<typeof createTicketMessageInputSchema>;
