import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { ConflictError, NotFoundError } from "../../lib/errors.js";
import type {
  CreateCustomerInput,
  ListCustomersQuery,
  UpdateCustomerInput,
} from "@supportdesk/shared";

export const customersService = {
  async list(query: ListCustomersQuery) {
    const where: Prisma.CustomerWhereInput = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { company: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.customer.count({ where }),
    ]);

    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async getById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        tickets: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { assignee: { select: { id: true, name: true, email: true } } },
        },
      },
    });
    if (!customer) throw new NotFoundError("Cliente");
    return customer;
  },

  async create(input: CreateCustomerInput) {
    const existing = await prisma.customer.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictError("Já existe um cliente com este e-mail");

    return prisma.customer.create({
      data: {
        name: input.name,
        email: input.email,
        company: input.company ?? null,
        phone: input.phone ?? null,
        status: input.status,
      },
    });
  },

  async update(id: string, input: UpdateCustomerInput) {
    await this.getById(id);
    return prisma.customer.update({
      where: { id },
      data: input,
    });
  },

  async remove(id: string) {
    await this.getById(id);
    await prisma.customer.delete({ where: { id } });
  },
};
