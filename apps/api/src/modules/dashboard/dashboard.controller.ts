import type { FastifyReply, FastifyRequest } from "fastify";
import { dashboardService } from "./dashboard.service.js";

export const dashboardController = {
  async metrics(request: FastifyRequest, reply: FastifyReply) {
    const data = await dashboardService.metrics(request.currentUser);
    return reply.send(data);
  },
};
