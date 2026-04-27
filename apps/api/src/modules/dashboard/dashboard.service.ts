import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import type { AuthenticatedUser } from "../../plugins/auth.js";

function scope(user: AuthenticatedUser): Prisma.TicketWhereInput {
  if (user.role === "CUSTOMER") {
    return { customer: { user: { id: user.sub } } };
  }
  return {};
}

export const dashboardService = {
  async metrics(user: AuthenticatedUser) {
    const base = scope(user);
    const now = new Date();

    const [total, open, inProgress, resolved, critical, slaBreached, recent] = await Promise.all([
      prisma.ticket.count({ where: base }),
      prisma.ticket.count({ where: { ...base, status: "OPEN" } }),
      prisma.ticket.count({ where: { ...base, status: "IN_PROGRESS" } }),
      prisma.ticket.count({ where: { ...base, status: "RESOLVED" } }),
      prisma.ticket.count({ where: { ...base, priority: "CRITICAL" } }),
      prisma.ticket.count({
        where: {
          ...base,
          slaDueAt: { lt: now },
          status: { notIn: ["RESOLVED", "CANCELLED"] },
        },
      }),
      prisma.ticket.findMany({
        where: base,
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          customer: { select: { id: true, name: true, company: true, email: true } },
          assignee: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return { total, open, inProgress, resolved, critical, slaBreached, recent };
  },
};
