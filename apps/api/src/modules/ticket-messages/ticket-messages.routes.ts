import type { FastifyInstance } from "fastify";
import { ticketMessagesController } from "./ticket-messages.controller.js";

export async function ticketMessagesRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticate);

  app.get("/tickets/:id/messages", ticketMessagesController.list);
  app.post("/tickets/:id/messages", ticketMessagesController.create);
}
