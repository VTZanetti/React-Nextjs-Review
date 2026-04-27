import type { FastifyInstance } from "fastify";
import { customersController } from "./customers.controller.js";

export async function customersRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticate);

  const staff = app.requireRole("ADMIN", "AGENT");
  const adminOnly = app.requireRole("ADMIN");

  // Read: any staff member.
  app.get("/customers", { preHandler: staff }, customersController.list);
  app.get<{ Params: { id: string } }>(
    "/customers/:id",
    { preHandler: staff },
    customersController.getById,
  );

  // Mutations: ADMIN only — agents have read-only access to customers.
  app.post("/customers", { preHandler: adminOnly }, customersController.create);
  app.patch<{ Params: { id: string } }>(
    "/customers/:id",
    { preHandler: adminOnly },
    customersController.update,
  );
  app.delete<{ Params: { id: string } }>(
    "/customers/:id",
    { preHandler: adminOnly },
    customersController.remove,
  );
}
