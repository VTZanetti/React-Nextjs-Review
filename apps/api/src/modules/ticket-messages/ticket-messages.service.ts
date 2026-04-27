import { prisma } from "../../lib/prisma.js";
import { ForbiddenError, NotFoundError } from "../../lib/errors.js";
import type { CreateTicketMessageInput } from "@supportdesk/shared";
import type { AuthenticatedUser } from "../../plugins/auth.js";
import { ticketEventsService } from "../tickets/ticket-events.service.js";

async function ensureTicketAccess(ticketId: string, user: AuthenticatedUser) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { customer: true },
  });
  if (!ticket) throw new NotFoundError("Chamado");

  if (user.role === "CUSTOMER") {
    const userRecord = await prisma.user.findUnique({
      where: { id: user.sub },
      select: { customerId: true },
    });
    if (!userRecord?.customerId || userRecord.customerId !== ticket.customerId) {
      throw new ForbiddenError("Você não tem acesso a este chamado");
    }
  }
  return ticket;
}

export const ticketMessagesService = {
  async list(ticketId: string, user: AuthenticatedUser) {
    await ensureTicketAccess(ticketId, user);
    const messages = await prisma.ticketMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { id: true, name: true, role: true } } },
    });
    return messages.map((m) => ({
      id: m.id,
      ticketId: m.ticketId,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      authorId: m.authorId,
      authorName: m.author.name,
      authorRole: m.author.role,
    }));
  },

  async create(ticketId: string, input: CreateTicketMessageInput, user: AuthenticatedUser) {
    await ensureTicketAccess(ticketId, user);

    return prisma.$transaction(async (tx) => {
      const message = await tx.ticketMessage.create({
        data: {
          ticketId,
          authorId: user.sub,
          content: input.content,
        },
        include: { author: { select: { id: true, name: true, role: true } } },
      });

      await ticketEventsService.record(tx, {
        ticketId,
        type: "MESSAGE_SENT",
        authorId: user.sub,
        payload: { messageId: message.id },
      });

      return {
        id: message.id,
        ticketId: message.ticketId,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        authorId: message.authorId,
        authorName: message.author.name,
        authorRole: message.author.role,
      };
    });
  },
};
