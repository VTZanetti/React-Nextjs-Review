import type { FastifyInstance } from "fastify";
import { authController } from "./auth.controller.js";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/login", { schema: { tags: ["auth"] } }, authController.login);

  app.get(
    "/auth/me",
    { onRequest: [app.authenticate], schema: { tags: ["auth"], security: [{ bearerAuth: [] }] } },
    authController.me,
  );
}
