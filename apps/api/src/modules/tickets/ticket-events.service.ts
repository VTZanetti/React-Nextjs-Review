import { Prisma, type PrismaClient, type TicketEventType } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export const ticketEventsService = {
  async record(
    db: Tx | PrismaClient,
    params: {
      ticketId: string;
      type: TicketEventType;
      authorId?: string | null;
      payload?: Prisma.InputJsonValue | null;
    },
  ) {
    return db.ticketEvent.create({
      data: {
        ticketId: params.ticketId,
        type: params.type,
        authorId: params.authorId ?? null,
        payload: params.payload ?? Prisma.JsonNull,
      },
    });
  },

  async listForTicket(ticketId: string) {
    return prisma.ticketEvent.findMany({
      where: { ticketId },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { id: true, name: true, role: true } } },
    });
  },
};
