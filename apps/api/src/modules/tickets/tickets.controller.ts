import type { FastifyReply, FastifyRequest } from "fastify";
import {
  assignTicketSchema,
  createTicketInputSchema,
  listTicketsQuerySchema,
  updateTicketPrioritySchema,
  updateTicketStatusSchema,
} from "@supportdesk/shared";
import { ticketsService } from "./tickets.service.js";
import { ticketEventsService } from "./ticket-events.service.js";

export const ticketsController = {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listTicketsQuerySchema.parse(request.query);
    const result = await ticketsService.list(query, request.currentUser);
    return reply.send(result);
  },

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const ticket = await ticketsService.getById(request.params.id, request.currentUser);
    return reply.send(ticket);
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createTicketInputSchema.parse(request.body);
    const ticket = await ticketsService.create(input, request.currentUser);
    return reply.status(201).send(ticket);
  },

  async updateStatus(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const input = updateTicketStatusSchema.parse(request.body);
    const ticket = await ticketsService.updateStatus(
      request.params.id,
      input,
      request.currentUser,
    );
    return reply.send(ticket);
  },

  async updatePriority(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const input = updateTicketPrioritySchema.parse(request.body);
    const ticket = await ticketsService.updatePriority(
      request.params.id,
      input,
      request.currentUser,
    );
    return reply.send(ticket);
  },

  async assign(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const input = assignTicketSchema.parse(request.body);
    const ticket = await ticketsService.assign(request.params.id, input, request.currentUser);
    return reply.send(ticket);
  },

  async events(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await ticketsService.getById(request.params.id, request.currentUser);
    const events = await ticketEventsService.listForTicket(request.params.id);
    return reply.send(events);
  },
};
