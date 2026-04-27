"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { knowledgeBaseService } from "@/services/knowledge-base-service";

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["knowledge-base", { search }],
    queryFn: () => knowledgeBaseService.list({ search: search || undefined }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Base de conhecimento"
        description="Artigos, tutoriais e procedimentos para autoatendimento e operação."
      />

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar artigos por título ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {query.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      ) : !query.data?.length ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhum artigo encontrado"
          description="Crie artigos para que clientes e atendentes consultem soluções rapidamente."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {query.data.map((article) => (
            <Link
              key={article.id}
              href={`/dashboard/knowledge-base/${article.slug}`}
              className="group"
            >
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <Badge variant="info">{article.category}</Badge>
                    <Badge variant={article.visibility === "PUBLIC" ? "success" : "muted"}>
                      {article.visibility === "PUBLIC" ? "Público" : "Interno"}
                    </Badge>
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-base font-semibold group-hover:text-primary">
                    {article.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {article.content.replace(/[#*`>\-]/g, "").slice(0, 160)}…
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
