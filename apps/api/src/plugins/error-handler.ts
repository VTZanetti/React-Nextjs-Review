import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { ZodError } from "zod";
import { AppError } from "../lib/errors.js";

async function errorHandlerPlugin(app: FastifyInstance) {
  app.setErrorHandler((error: Error & { statusCode?: number }, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(422).send({
        statusCode: 422,
        code: "VALIDATION_ERROR",
        message: "Dados inválidos",
        issues: error.flatten().fieldErrors,
      });
    }

    if ((error as { validation?: unknown }).validation) {
      return reply.status(400).send({
        statusCode: 400,
        code: "BAD_REQUEST",
        message: error.message,
      });
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
    }

    request.log.error({ err: error }, "Unhandled error");

    return reply.status(error.statusCode ?? 500).send({
      statusCode: error.statusCode ?? 500,
      code: "INTERNAL_ERROR",
      message:
        process.env.NODE_ENV === "production" ? "Erro interno do servidor" : error.message,
    });
  });
}

export default fp(errorHandlerPlugin, { name: "error-handler" });
