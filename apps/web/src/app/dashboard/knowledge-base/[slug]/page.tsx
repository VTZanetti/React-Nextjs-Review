"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/error-state";
import { PageHeader } from "@/components/page-header";
import { BackLink } from "@/components/back-link";
import { knowledgeBaseService } from "@/services/knowledge-base-service";
import { formatDateTime } from "@/lib/utils";

export default function KnowledgeArticlePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const query = useQuery({
    queryKey: ["knowledge-base", slug],
    queryFn: () => knowledgeBaseService.getBySlug(slug),
  });

  if (query.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (query.isError || !query.data) {
    return <ErrorState message="Artigo não encontrado." />;
  }

  const article = query.data;

  return (
    <div className="space-y-6">
      <BackLink href="/dashboard/knowledge-base" />

      <PageHeader
        title={article.title}
        description={`Categoria: ${article.category} · Atualizado em ${formatDateTime(article.updatedAt)}`}
        actions={
          <Badge variant={article.visibility === "PUBLIC" ? "success" : "muted"}>
            {article.visibility === "PUBLIC" ? "Público" : "Interno"}
          </Badge>
        }
      />

      <Card>
        <CardContent className="prose prose-sm max-w-none p-6">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-foreground">
            {article.content}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
