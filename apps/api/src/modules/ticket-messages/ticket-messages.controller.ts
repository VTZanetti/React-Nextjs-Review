import type { FastifyReply, FastifyRequest } from "fastify";
import { createTicketMessageInputSchema } from "@supportdesk/shared";
import { ticketMessagesService } from "./ticket-messages.service.js";

export const ticketMessagesController = {
  async list(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const messages = await ticketMessagesService.list(request.params.id, request.currentUser);
    return reply.send(messages);
  },

  async create(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const input = createTicketMessageInputSchema.parse(request.body);
    const message = await ticketMessagesService.create(
      request.params.id,
      input,
      request.currentUser,
    );
    return reply.status(201).send(message);
  },
};
