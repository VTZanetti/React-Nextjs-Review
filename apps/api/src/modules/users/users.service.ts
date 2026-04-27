import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import { ConflictError, NotFoundError } from "../../lib/errors.js";
import type { CreateUserInput } from "@supportdesk/shared";

export const usersService = {
  async list() {
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  },

  async listAgents() {
    return prisma.user.findMany({
      where: { role: { in: ["ADMIN", "AGENT"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, role: true },
    });
  },

  async create(input: CreateUserInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictError("Já existe um usuário com este e-mail");

    const passwordHash = await bcrypt.hash(input.password, 10);
    return prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
        passwordHash,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw new NotFoundError("Usuário");
    return user;
  },
};
