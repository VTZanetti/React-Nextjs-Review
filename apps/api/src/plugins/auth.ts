import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import jwtPlugin from "@fastify/jwt";
import { env } from "../config/env.js";
import { UnauthorizedError, ForbiddenError } from "../lib/errors.js";
import type { UserRole } from "@supportdesk/shared";

export type AuthenticatedUser = {
  sub: string;
  role: UserRole;
  email: string;
  name: string;
};

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (
      ...roles: UserRole[]
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    currentUser: AuthenticatedUser;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AuthenticatedUser;
    user: AuthenticatedUser;
  }
}

async function authPlugin(app: FastifyInstance) {
  await app.register(jwtPlugin, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  });

  app.decorate("authenticate", async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      request.currentUser = request.user;
    } catch {
      throw new UnauthorizedError("Token inválido ou expirado");
    }
  });

  app.decorate(
    "requireRole",
    (...roles: UserRole[]) =>
      async (request: FastifyRequest, _reply: FastifyReply) => {
        if (!request.currentUser) {
          throw new UnauthorizedError();
        }
        if (!roles.includes(request.currentUser.role)) {
          throw new ForbiddenError("Você não tem permissão para esta operação");
        }
      },
  );
}

export default fp(authPlugin, { name: "auth" });
