import { z } from "zod";

export const knowledgeArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  category: z.string(),
  content: z.string(),
  visibility: z.enum(["PUBLIC", "INTERNAL"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type KnowledgeArticle = z.infer<typeof knowledgeArticleSchema>;

export const createKnowledgeArticleInputSchema = z.object({
  title: z.string().min(3, "Título muito curto"),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras, números e hífens"),
  category: z.string().min(1, "Categoria obrigatória"),
  content: z.string().min(10, "Conteúdo muito curto"),
  visibility: z.enum(["PUBLIC", "INTERNAL"]).default("PUBLIC"),
});
export type CreateKnowledgeArticleInput = z.infer<typeof createKnowledgeArticleInputSchema>;

export const updateKnowledgeArticleInputSchema = createKnowledgeArticleInputSchema.partial();
export type UpdateKnowledgeArticleInput = z.infer<typeof updateKnowledgeArticleInputSchema>;

export const listArticlesQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  visibility: z.enum(["PUBLIC", "INTERNAL"]).optional(),
});
export type ListArticlesQuery = z.infer<typeof listArticlesQuerySchema>;
