import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { ConflictError, NotFoundError } from "../../lib/errors.js";
import type {
  CreateKnowledgeArticleInput,
  ListArticlesQuery,
  UpdateKnowledgeArticleInput,
} from "@supportdesk/shared";
import type { AuthenticatedUser } from "../../plugins/auth.js";

export const knowledgeBaseService = {
  async list(query: ListArticlesQuery, user: AuthenticatedUser | null) {
    const where: Prisma.KnowledgeArticleWhereInput = {};
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { content: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.category) where.category = query.category;
    if (query.visibility) where.visibility = query.visibility;

    if (!user || user.role === "CUSTOMER") {
      where.visibility = "PUBLIC";
    }

    return prisma.knowledgeArticle.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });
  },

  async getBySlug(slug: string, user: AuthenticatedUser | null) {
    const article = await prisma.knowledgeArticle.findUnique({ where: { slug } });
    if (!article) throw new NotFoundError("Artigo");

    if (article.visibility === "INTERNAL") {
      if (!user || user.role === "CUSTOMER") {
        throw new NotFoundError("Artigo");
      }
    }
    return article;
  },

  async create(input: CreateKnowledgeArticleInput) {
    const existing = await prisma.knowledgeArticle.findUnique({ where: { slug: input.slug } });
    if (existing) throw new ConflictError("Já existe um artigo com este slug");

    return prisma.knowledgeArticle.create({ data: input });
  },

  async update(id: string, input: UpdateKnowledgeArticleInput) {
    const existing = await prisma.knowledgeArticle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Artigo");

    if (input.slug && input.slug !== existing.slug) {
      const slugConflict = await prisma.knowledgeArticle.findUnique({ where: { slug: input.slug } });
      if (slugConflict) throw new ConflictError("Já existe um artigo com este slug");
    }

    return prisma.knowledgeArticle.update({ where: { id }, data: input });
  },

  async remove(id: string) {
    const existing = await prisma.knowledgeArticle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Artigo");
    await prisma.knowledgeArticle.delete({ where: { id } });
  },
};
