"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Building2, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { BackLink } from "@/components/back-link";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { SlaIndicator } from "@/components/sla-indicator";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { customersService } from "@/services/customers-service";
import { formatDateTime } from "@/lib/utils";
import { AuthGuard } from "@/components/layout/auth-guard";

export default function CustomerDetailPage() {
  return (
    <AuthGuard roles={["ADMIN", "AGENT"]}>
      <CustomerDetailInner />
    </AuthGuard>
  );
}

function CustomerDetailInner() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const query = useQuery({
    queryKey: ["customer", id],
    queryFn: () => customersService.getById(id),
  });

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return <ErrorState message="Cliente não encontrado." />;
  }

  const customer = query.data;

  return (
    <div className="space-y-6">
      <BackLink href="/dashboard/customers" label="Voltar para clientes" />

      <PageHeader
        title={customer.name}
        description={customer.company ?? "Cliente independente"}
        actions={
          <Badge variant={customer.status === "ACTIVE" ? "success" : "muted"}>
            {customer.status === "ACTIVE" ? "Ativo" : "Inativo"}
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" /> {customer.email}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" /> {customer.phone ?? "Sem telefone"}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" /> {customer.company ?? "—"}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Chamados deste cliente</CardTitle>
          </CardHeader>
          <CardContent>
            {!customer.tickets?.length ? (
              <EmptyState
                title="Sem chamados ainda"
                description="Quando este cliente abrir chamados, eles aparecerão aqui."
              />
            ) : (
              <ul className="divide-y">
                {customer.tickets.map((ticket) => (
                  <li key={ticket.id} className="py-3">
                    <Link
                      href={`/dashboard/tickets/${ticket.id}`}
                      className="flex items-start justify-between gap-4 rounded-lg p-2 hover:bg-accent"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            {ticket.protocol}
                          </span>
                          <span className="truncate font-medium">{ticket.title}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatDateTime(ticket.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                        <SlaIndicator slaDueAt={ticket.slaDueAt} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
