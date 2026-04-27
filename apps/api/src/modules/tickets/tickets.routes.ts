import type { FastifyInstance } from "fastify";
import { ticketsController } from "./tickets.controller.js";

export async function ticketsRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticate);

  const staff = app.requireRole("ADMIN", "AGENT");

  app.get("/tickets", ticketsController.list);
  app.get<{ Params: { id: string } }>("/tickets/:id", ticketsController.getById);
  app.get<{ Params: { id: string } }>("/tickets/:id/events", ticketsController.events);
  app.post("/tickets", ticketsController.create);
  app.patch<{ Params: { id: string } }>(
    "/tickets/:id/status",
    { preHandler: staff },
    ticketsController.updateStatus,
  );
  app.patch<{ Params: { id: string } }>(
    "/tickets/:id/priority",
    { preHandler: staff },
    ticketsController.updatePriority,
  );
  app.patch<{ Params: { id: string } }>(
    "/tickets/:id/assignee",
    { preHandler: staff },
    ticketsController.assign,
  );
}
