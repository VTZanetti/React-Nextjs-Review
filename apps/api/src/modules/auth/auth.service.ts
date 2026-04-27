import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import { UnauthorizedError } from "../../lib/errors.js";
import type { LoginInput } from "@supportdesk/shared";

export const authService = {
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw new UnauthorizedError("Credenciais inválidas");

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Credenciais inválidas");

    return user;
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedError("Usuário não encontrado");
    return user;
  },
};
