import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { env } from "./config/env.js";
import authPlugin from "./plugins/auth.js";
import errorHandlerPlugin from "./plugins/error-handler.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { usersRoutes } from "./modules/users/users.routes.js";
import { customersRoutes } from "./modules/customers/customers.routes.js";
import { ticketsRoutes } from "./modules/tickets/tickets.routes.js";
import { ticketMessagesRoutes } from "./modules/ticket-messages/ticket-messages.routes.js";
import { knowledgeBaseRoutes } from "./modules/knowledge-base/knowledge-base.routes.js";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger:
      env.NODE_ENV === "production"
        ? true
        : { transport: { target: "pino-pretty", options: { colorize: true } } },
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
    credentials: true,
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "SupportDesk API",
        description: "Help Desk system — tickets, customers, SLA and knowledge base.",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
    },
  });
  await app.register(swaggerUI, { routePrefix: "/docs" });

  await app.register(errorHandlerPlugin);
  await app.register(authPlugin);

  app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

  await app.register(authRoutes, { prefix: "/api" });
  await app.register(usersRoutes, { prefix: "/api" });
  await app.register(customersRoutes, { prefix: "/api" });
  await app.register(ticketsRoutes, { prefix: "/api" });
  await app.register(ticketMessagesRoutes, { prefix: "/api" });
  await app.register(knowledgeBaseRoutes, { prefix: "/api" });
  await app.register(dashboardRoutes, { prefix: "/api" });

  return app;
}
