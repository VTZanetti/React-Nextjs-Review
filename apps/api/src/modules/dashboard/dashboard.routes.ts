import type { FastifyInstance } from "fastify";
import { dashboardController } from "./dashboard.controller.js";

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticate);

  app.get("/dashboard/metrics", dashboardController.metrics);
}
