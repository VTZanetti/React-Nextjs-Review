import type { FastifyReply, FastifyRequest } from "fastify";
import {
  createCustomerInputSchema,
  listCustomersQuerySchema,
  updateCustomerInputSchema,
} from "@supportdesk/shared";
import { customersService } from "./customers.service.js";

export const customersController = {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listCustomersQuerySchema.parse(request.query);
    const result = await customersService.list(query);
    return reply.send(result);
  },

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const customer = await customersService.getById(request.params.id);
    return reply.send(customer);
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createCustomerInputSchema.parse(request.body);
    const customer = await customersService.create(input);
    return reply.status(201).send(customer);
  },

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const input = updateCustomerInputSchema.parse(request.body);
    const customer = await customersService.update(request.params.id, input);
    return reply.send(customer);
  },

  async remove(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await customersService.remove(request.params.id);
    return reply.status(204).send();
  },
};
