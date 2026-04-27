import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { ForbiddenError, NotFoundError } from "../../lib/errors.js";
import { generateTicketProtocol } from "../../lib/protocol.js";
import { calculateSlaDueAt } from "@supportdesk/shared";
import type {
  AssignTicketInput,
  CreateTicketInput,
  ListTicketsQuery,
  UpdateTicketPriorityInput,
  UpdateTicketStatusInput,
} from "@supportdesk/shared";
import type { AuthenticatedUser } from "../../plugins/auth.js";
import { ticketEventsService } from "./ticket-events.service.js";

const ticketInclude = {
  customer: { select: { id: true, name: true, company: true, email: true } },
  assignee: { select: { id: true, name: true, email: true } },
} satisfies Prisma.TicketInclude;

function applyAccessScope(
  where: Prisma.TicketWhereInput,
  user: AuthenticatedUser,
): Prisma.TicketWhereInput {
  if (user.role === "CUSTOMER") {
    return { ...where, customer: { user: { id: user.sub } } };
  }
  return where;
}

export const ticketsService = {
  async list(query: ListTicketsQuery, user: AuthenticatedUser) {
    const where: Prisma.TicketWhereInput = {};
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { protocol: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.category) where.category = query.category;
    if (query.customerId) where.customerId = query.customerId;
    if (query.assigneeId) where.assigneeId = query.assigneeId;

    const scoped = applyAccessScope(where, user);

    const [items, total] = await Promise.all([
      prisma.ticket.findMany({
        where: scoped,
        include: ticketInclude,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.ticket.count({ where: scoped }),
    ]);

    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async getById(id: string, user: AuthenticatedUser) {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: ticketInclude,
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
  },

  async create(input: CreateTicketInput, user: AuthenticatedUser) {
    let customerId = input.customerId;

    if (user.role === "CUSTOMER") {
      const userRecord = await prisma.user.findUnique({
        where: { id: user.sub },
        select: { customerId: true },
      });
      if (!userRecord?.customerId) {
        throw new ForbiddenError("Sua conta de cliente não está vinculada a um cadastro");
      }
      customerId = userRecord.customerId;
    } else if (!customerId) {
      throw new NotFoundError("Cliente");
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundError("Cliente");

    const slaDueAt = calculateSlaDueAt(input.priority);

    return prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          protocol: generateTicketProtocol(),
          title: input.title,
          description: input.description,
          priority: input.priority,
          category: input.category,
          customerId,
          slaDueAt,
        },
        include: ticketInclude,
      });

      await ticketEventsService.record(tx, {
        ticketId: ticket.id,
        type: "CREATED",
        authorId: user.sub,
        payload: { priority: ticket.priority, category: ticket.category },
      });

      return ticket;
    });
  },

  async updateStatus(id: string, input: UpdateTicketStatusInput, user: AuthenticatedUser) {
    const ticket = await this.getById(id, user);
    const previous = ticket.status;
    if (previous === input.status) return ticket;

    return prisma.$transaction(async (tx) => {
      const updated = await tx.ticket.update({
        where: { id },
        data: {
          status: input.status,
          resolvedAt: input.status === "RESOLVED" ? new Date() : ticket.resolvedAt,
        },
        include: ticketInclude,
      });

      await ticketEventsService.record(tx, {
        ticketId: id,
        type: "STATUS_CHANGED",
        authorId: user.sub,
        payload: { from: previous, to: input.status },
      });

      if (input.status === "RESOLVED") {
        await ticketEventsService.record(tx, {
          ticketId: id,
          type: "RESOLVED",
          authorId: user.sub,
        });
      } else if (input.status === "CANCELLED") {
        await ticketEventsService.record(tx, {
          ticketId: id,
          type: "CANCELLED",
          authorId: user.sub,
        });
      } else if (previous === "RESOLVED" || previous === "CANCELLED") {
        await ticketEventsService.record(tx, {
          ticketId: id,
          type: "REOPENED",
          authorId: user.sub,
        });
      }

      return updated;
    });
  },

  async updatePriority(id: string, input: UpdateTicketPriorityInput, user: AuthenticatedUser) {
    const ticket = await this.getById(id, user);
    if (ticket.priority === input.priority) return ticket;

    const slaDueAt = calculateSlaDueAt(input.priority, ticket.createdAt);

    return prisma.$transaction(async (tx) => {
      const updated = await tx.ticket.update({
        where: { id },
        data: { priority: input.priority, slaDueAt },
        include: ticketInclude,
      });

      await ticketEventsService.record(tx, {
        ticketId: id,
        type: "PRIORITY_CHANGED",
        authorId: user.sub,
        payload: { from: ticket.priority, to: input.priority },
      });

      return updated;
    });
  },

  async assign(id: string, input: AssignTicketInput, user: AuthenticatedUser) {
    const ticket = await this.getById(id, user);
    if (ticket.assigneeId === input.assigneeId) return ticket;

    if (input.assigneeId) {
      const assignee = await prisma.user.findUnique({ where: { id: input.assigneeId } });
      if (!assignee) throw new NotFoundError("Atendente");
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.ticket.update({
        where: { id },
        data: { assigneeId: input.assigneeId },
        include: ticketInclude,
      });

      await ticketEventsService.record(tx, {
        ticketId: id,
        type: "ASSIGNED",
        authorId: user.sub,
        payload: { from: ticket.assigneeId, to: input.assigneeId },
      });

      return updated;
    });
  },
};
