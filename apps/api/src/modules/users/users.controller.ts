import type { FastifyReply, FastifyRequest } from "fastify";
import { createUserInputSchema } from "@supportdesk/shared";
import { usersService } from "./users.service.js";

export const usersController = {
  async list(_request: FastifyRequest, reply: FastifyReply) {
    const users = await usersService.list();
    return reply.send(users);
  },

  async listAgents(_request: FastifyRequest, reply: FastifyReply) {
    const agents = await usersService.listAgents();
    return reply.send(agents);
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createUserInputSchema.parse(request.body);
    const user = await usersService.create(input);
    return reply.status(201).send(user);
  },

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const user = await usersService.getById(request.params.id);
    return reply.send(user);
  },
};
