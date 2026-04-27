import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { knowledgeBaseController } from "./knowledge-base.controller.js";

export async function knowledgeBaseRoutes(app: FastifyInstance) {
  // Optional auth: list/getBySlug honor visibility based on role.
  const optionalAuth = async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      request.currentUser = request.user;
    } catch {
      // anonymous reader
    }
  };

  app.get("/knowledge-base", { onRequest: [optionalAuth] }, knowledgeBaseController.list);
  app.get<{ Params: { slug: string } }>(
    "/knowledge-base/:slug",
    { onRequest: [optionalAuth] },
    knowledgeBaseController.getBySlug,
  );

  app.post(
    "/knowledge-base",
    { onRequest: [app.authenticate], preHandler: app.requireRole("ADMIN", "AGENT") },
    knowledgeBaseController.create,
  );
  app.patch<{ Params: { id: string } }>(
    "/knowledge-base/:id",
    { onRequest: [app.authenticate], preHandler: app.requireRole("ADMIN", "AGENT") },
    knowledgeBaseController.update,
  );
  app.delete<{ Params: { id: string } }>(
    "/knowledge-base/:id",
    { onRequest: [app.authenticate], preHandler: app.requireRole("ADMIN") },
    knowledgeBaseController.remove,
  );
}
