import type { FastifyInstance } from "fastify";
import { usersController } from "./users.controller.js";

export async function usersRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticate);

  app.get("/users", { preHandler: app.requireRole("ADMIN") }, usersController.list);
  app.get("/users/agents", { preHandler: app.requireRole("ADMIN", "AGENT") }, usersController.listAgents);
  app.get<{ Params: { id: string } }>(
    "/users/:id",
    { preHandler: app.requireRole("ADMIN") },
    usersController.getById,
  );
  app.post("/users", { preHandler: app.requireRole("ADMIN") }, usersController.create);
}
