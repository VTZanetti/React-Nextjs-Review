import type { FastifyReply, FastifyRequest } from "fastify";
import { loginInputSchema } from "@supportdesk/shared";
import { authService } from "./auth.service.js";

export const authController = {
  async login(request: FastifyRequest, reply: FastifyReply) {
    const input = loginInputSchema.parse(request.body);
    const user = await authService.login(input);

    const token = await reply.jwtSign({
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    });

    return reply.send({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    });
  },

  async me(request: FastifyRequest, reply: FastifyReply) {
    const user = await authService.getById(request.currentUser.sub);
    return reply.send({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    });
  },
};
