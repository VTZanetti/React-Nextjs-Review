import type { FastifyReply, FastifyRequest } from "fastify";
import {
  createKnowledgeArticleInputSchema,
  listArticlesQuerySchema,
  updateKnowledgeArticleInputSchema,
} from "@supportdesk/shared";
import { knowledgeBaseService } from "./knowledge-base.service.js";

export const knowledgeBaseController = {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listArticlesQuerySchema.parse(request.query);
    const articles = await knowledgeBaseService.list(query, request.currentUser ?? null);
    return reply.send(articles);
  },

  async getBySlug(
    request: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply,
  ) {
    const article = await knowledgeBaseService.getBySlug(
      request.params.slug,
      request.currentUser ?? null,
    );
    return reply.send(article);
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createKnowledgeArticleInputSchema.parse(request.body);
    const article = await knowledgeBaseService.create(input);
    return reply.status(201).send(article);
  },

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const input = updateKnowledgeArticleInputSchema.parse(request.body);
    const article = await knowledgeBaseService.update(request.params.id, input);
    return reply.send(article);
  },

  async remove(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await knowledgeBaseService.remove(request.params.id);
    return reply.status(204).send();
  },
};
