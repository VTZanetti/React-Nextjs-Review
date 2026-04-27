import { apiClient } from "@/lib/api-client";
import type {
  CreateKnowledgeArticleInput,
  KnowledgeArticle,
  ListArticlesQuery,
  UpdateKnowledgeArticleInput,
} from "@supportdesk/shared";

export const knowledgeBaseService = {
  async list(query: Partial<ListArticlesQuery> = {}): Promise<KnowledgeArticle[]> {
    const { data } = await apiClient.get<KnowledgeArticle[]>("/knowledge-base", { params: query });
    return data;
  },
  async getBySlug(slug: string): Promise<KnowledgeArticle> {
    const { data } = await apiClient.get<KnowledgeArticle>(`/knowledge-base/${slug}`);
    return data;
  },
  async create(input: CreateKnowledgeArticleInput): Promise<KnowledgeArticle> {
    const { data } = await apiClient.post<KnowledgeArticle>("/knowledge-base", input);
    return data;
  },
  async update(id: string, input: UpdateKnowledgeArticleInput): Promise<KnowledgeArticle> {
    const { data } = await apiClient.patch<KnowledgeArticle>(`/knowledge-base/${id}`, input);
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/knowledge-base/${id}`);
  },
};
